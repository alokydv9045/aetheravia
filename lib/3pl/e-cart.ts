// E-Cart 3PL Integration Service
interface ECartConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
}

interface ECartResponse {
  success: boolean;
  shipmentId: string;
  trackingId: string;
  courierPartner: string;
  estimatedDelivery: string;
  shippingCharges: number;
  error?: string;
}

export class ECartService {
  private config: ECartConfig;

  constructor(config: ECartConfig) {
    this.config = config;
  }

  // Generate Authentication Token
  private generateAuthToken(): string {
    const timestamp = Date.now().toString();
    const signature = Buffer.from(`${this.config.apiKey}:${this.config.secretKey}:${timestamp}`).toString('base64');
    return signature;
  }

  // Create Shipment
  async createShipment(shipmentData: any): Promise<ECartResponse> {
    try {
      const payload = {
        order_id: shipmentData.orderId,
        shipment_date: new Date().toISOString().split('T')[0],
        pickup_details: {
          pickup_location: shipmentData.pickupDetails.name,
          pickup_address: shipmentData.pickupDetails.address,
          pickup_city: shipmentData.pickupDetails.city,
          pickup_state: shipmentData.pickupDetails.state,
          pickup_pincode: shipmentData.pickupDetails.pincode,
          pickup_phone: shipmentData.pickupDetails.phone,
        },
        delivery_details: {
          consignee_name: shipmentData.customerDetails.name,
          consignee_address: shipmentData.customerDetails.address,
          consignee_city: shipmentData.customerDetails.city,
          consignee_state: shipmentData.customerDetails.state,
          consignee_pincode: shipmentData.customerDetails.pincode,
          consignee_phone: shipmentData.customerDetails.phone,
        },
        package_details: {
          weight: shipmentData.orderDetails.totalWeight,
          length: shipmentData.orderDetails.items[0]?.dimensions?.length || 10,
          width: shipmentData.orderDetails.items[0]?.dimensions?.width || 10,
          height: shipmentData.orderDetails.items[0]?.dimensions?.height || 5,
          declared_value: shipmentData.orderDetails.totalValue,
          item_description: shipmentData.orderDetails.items.map((item: any) => item.name).join(', '),
        },
        payment_details: {
          payment_mode: shipmentData.orderDetails.paymentType,
          cod_amount: shipmentData.orderDetails.codAmount || 0,
        },
      };

      const response = await fetch(`${this.config.baseUrl}/api/v2/shipments/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.generateAuthToken()}`,
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === 'success') {
        return {
          success: true,
          shipmentId: data.shipment_id,
          trackingId: data.tracking_number,
          courierPartner: data.courier_partner,
          estimatedDelivery: data.estimated_delivery_date,
          shippingCharges: data.shipping_charges,
        };
      } else {
        throw new Error(data.message || 'Failed to create shipment');
      }
    } catch (error: any) {
      return {
        success: false,
        shipmentId: '',
        trackingId: '',
        courierPartner: '',
        estimatedDelivery: '',
        shippingCharges: 0,
        error: error.message,
      };
    }
  }

  // Track Shipment
  async trackShipment(trackingId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v2/shipments/track?tracking_id=${trackingId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.generateAuthToken()}`,
            'X-API-Key': this.config.apiKey,
          },
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        return {
          success: true,
          trackingId,
          status: data.tracking_data.current_status,
          statusCode: data.tracking_data.status_code,
          location: data.tracking_data.current_location,
          estimatedDelivery: data.tracking_data.expected_delivery_date,
          courierPartner: data.tracking_data.courier_partner,
          trackingHistory: data.tracking_data.scan_details,
        };
      } else {
        throw new Error(data.message || 'Failed to track shipment');
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Calculate Shipping Rates
  async calculateRates(shipmentData: any): Promise<any> {
    try {
      const payload = {
        pickup_pincode: shipmentData.pickupDetails.pincode,
        delivery_pincode: shipmentData.customerDetails.pincode,
        weight: shipmentData.orderDetails.totalWeight,
        declared_value: shipmentData.orderDetails.totalValue,
        payment_mode: shipmentData.orderDetails.paymentType,
      };

      const response = await fetch(`${this.config.baseUrl}/api/v2/rates/calculate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.generateAuthToken()}`,
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === 'success') {
        return {
          success: true,
          rates: data.rate_card.map((rate: any) => ({
            courierPartner: rate.courier_name,
            rate: rate.total_charge,
            estimatedDays: rate.delivery_time,
            codCharges: rate.cod_charges,
            fuelSurcharge: rate.fuel_surcharge,
          })),
        };
      } else {
        throw new Error(data.message || 'Failed to calculate rates');
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Cancel Shipment
  async cancelShipment(shipmentId: string, reason: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v2/shipments/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.generateAuthToken()}`,
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
        },
        body: JSON.stringify({
          shipment_id: shipmentId,
          cancellation_reason: reason,
        }),
      });

      const data = await response.json();

      return {
        success: data.status === 'success',
        message: data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}