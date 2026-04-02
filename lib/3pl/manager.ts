// 3PL Service Manager - Unified interface for multiple courier services
import { DeliveryComService } from './delivery-com';
import { ECartService } from './e-cart';
import { ShippoService } from './shippo';

export interface Courier3PLConfig {
  deliveryCom?: {
    apiKey: string;
    baseUrl: string;
    environment: 'sandbox' | 'production';
  };
  eCart?: {
    apiKey: string;
    secretKey: string;
    baseUrl: string;
    environment: 'sandbox' | 'production';
  };
  shippo: {
    apiKey: string;
    baseUrl: string;
    environment: 'test' | 'live';
  };
}

export interface UnifiedShipmentRequest {
  orderId: string;
  customerDetails: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email?: string;
  };
  orderDetails: {
    items: Array<{
      name: string;
      quantity: number;
      weight: number;
      dimensions?: {
        length: number;
        width: number;
        height: number;
      };
      price: number;
    }>;
    totalWeight: number;
    totalValue: number;
    paymentType: 'COD' | 'PREPAID';
    codAmount?: number;
  };
  pickupDetails: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  preferredCourier?: 'DELIVERY_COM' | 'E_CART' | 'SHIPPO' | 'AUTO';
}

export interface UnifiedShipmentResponse {
  success: boolean;
  provider: string;
  shipmentId: string;
  trackingId: string;
  courierName: string;
  estimatedDelivery: string;
  shippingCharges: number;
  error?: string;
}

export class Courier3PLManager {
  private deliveryComService?: DeliveryComService;
  private eCartService?: ECartService;
  private shippoService: ShippoService;

  constructor(config: Courier3PLConfig) {
    // Only initialize services if config is provided
    if (config.deliveryCom) {
      this.deliveryComService = new DeliveryComService(config.deliveryCom);
    }
    if (config.eCart) {
      this.eCartService = new ECartService(config.eCart);
    }
    this.shippoService = new ShippoService(config.shippo);
  }

  // Create shipment with automatic fallback
  async createShipment(shipmentData: UnifiedShipmentRequest): Promise<UnifiedShipmentResponse> {
    const providers = this.getProviderOrder(shipmentData.preferredCourier);

    for (const provider of providers) {
      try {
        let result;
        
        switch (provider) {
          case 'SHIPPO':
            result = await this.shippoService.createShipment(shipmentData);
            if (result.success) {
              return {
                ...result,
                provider: 'SHIPPO',
              };
            }
            break;
            
          case 'DELIVERY_COM':
            if (this.deliveryComService) {
              result = await this.deliveryComService.createShipment(shipmentData);
              if (result.success) {
                return {
                  ...result,
                  provider: 'DELIVERY_COM',
                };
              }
            }
            break;
            
          case 'E_CART':
            if (this.eCartService) {
              result = await this.eCartService.createShipment(shipmentData);
              if (result.success) {
                return {
                  success: result.success,
                  provider: 'E_CART',
                  shipmentId: result.shipmentId,
                  trackingId: result.trackingId,
                  courierName: result.courierPartner,
                  estimatedDelivery: result.estimatedDelivery,
                  shippingCharges: result.shippingCharges,
                };
              }
            }
            break;
        }
      } catch (error) {
        console.error(`Failed to create shipment with ${provider}:`, error);
        continue;
      }
    }

    return {
      success: false,
      provider: 'NONE',
      shipmentId: '',
      trackingId: '',
      courierName: '',
      estimatedDelivery: '',
      shippingCharges: 0,
      error: 'All courier services failed',
    };
  }

  // Track shipment across all providers
  async trackShipment(trackingId: string, provider?: string): Promise<any> {
    if (provider) {
      switch (provider) {
        case 'SHIPPO':
          return await this.shippoService.trackShipment(trackingId);
        case 'DELIVERY_COM':
          if (this.deliveryComService) {
            return await this.deliveryComService.trackShipment(trackingId);
          }
          break;
        case 'E_CART':
          if (this.eCartService) {
            return await this.eCartService.trackShipment(trackingId);
          }
          break;
      }
    }

    // Try all available providers if no specific provider given
    const providers = this.getAvailableProviders();
    
    for (const prov of providers) {
      try {
        const result = await this.trackShipment(trackingId, prov);
        if (result.success) {
          return { ...result, provider: prov };
        }
      } catch (error) {
        continue;
      }
    }

    return {
      success: false,
      error: 'Tracking ID not found in any provider',
    };
  }

  // Get available providers
  private getAvailableProviders(): string[] {
    const providers = ['SHIPPO']; // Shippo is always available
    if (this.deliveryComService) providers.push('DELIVERY_COM');
    if (this.eCartService) providers.push('E_CART');
    return providers;
  }

  // Get best rates from all available providers
  async getBestRates(shipmentData: Omit<UnifiedShipmentRequest, 'orderId'>): Promise<any> {
    const ratePromises = [
      this.shippoService.calculateRates(shipmentData).then(result => ({
        provider: 'SHIPPO',
        ...result,
      })),
    ];

    // Add optional providers
    if (this.deliveryComService) {
      ratePromises.push(
        this.deliveryComService.calculateRates(shipmentData).then(result => ({
          provider: 'DELIVERY_COM',
          ...result,
        }))
      );
    }

    if (this.eCartService) {
      ratePromises.push(
        this.eCartService.calculateRates(shipmentData).then(result => ({
          provider: 'E_CART',
          ...result,
        }))
      );
    }

    const results = await Promise.allSettled(ratePromises);
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<any> => 
        result.status === 'fulfilled' && result.value.success
      )
      .map(result => result.value);

    if (successfulResults.length === 0) {
      return {
        success: false,
        error: 'No rates available from any provider',
      };
    }

    // Combine and sort all rates
    const allRates = successfulResults.flatMap(result => 
      result.rates.map((rate: any) => ({
        ...rate,
        provider: result.provider,
      }))
    );

    return {
      success: true,
      rates: allRates.sort((a, b) => a.rate - b.rate), // Sort by cheapest first
    };
  }

  // Cancel shipment
  async cancelShipment(shipmentId: string, provider: string, reason: string): Promise<any> {
    switch (provider) {
      case 'SHIPPO':
        return await this.shippoService.cancelShipment(shipmentId, reason);
      case 'DELIVERY_COM':
        if (this.deliveryComService) {
          return await this.deliveryComService.cancelShipment(shipmentId, reason);
        }
        return { success: false, error: 'Delivery.com service not configured' };
      case 'E_CART':
        if (this.eCartService) {
          return await this.eCartService.cancelShipment(shipmentId, reason);
        }
        return { success: false, error: 'eCart service not configured' };
      default:
        return {
          success: false,
          error: 'Invalid provider',
        };
    }
  }

  private getProviderOrder(preferred?: string): string[] {
    const availableProviders = this.getAvailableProviders();
    
    if (preferred && preferred !== 'AUTO' && availableProviders.includes(preferred)) {
      return [preferred, ...availableProviders.filter((p: string) => p !== preferred)];
    }
    
    return availableProviders;
  }
}