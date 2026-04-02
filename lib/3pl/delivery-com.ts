// Delivery.com 3PL Integration Service
import axios from 'axios';

interface DeliveryComConfig {
  apiKey: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
}

interface ShipmentRequest {
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
      weight: number; // in grams
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
}

interface DeliveryComResponse {
  success: boolean;
  shipmentId: string;
  trackingId: string;
  courierName: string;
  estimatedDelivery: string;
  shippingCharges: number;
  error?: string;
}

export class DeliveryComService {
  private config: DeliveryComConfig;

  constructor(config: DeliveryComConfig) {
    this.config = config;
  }

  // Create Shipment
  async createShipment(shipmentData: ShipmentRequest): Promise<DeliveryComResponse> {
    try {
      const payload = {
        order_id: shipmentData.orderId,
        pickup_location: {
          name: shipmentData.pickupDetails.name,
          add: shipmentData.pickupDetails.address,
          city: shipmentData.pickupDetails.city,
          state: shipmentData.pickupDetails.state,
          pin_code: shipmentData.pickupDetails.pincode,
          phone: shipmentData.pickupDetails.phone,
        },
        delivery_location: {
          name: shipmentData.customerDetails.name,
          add: shipmentData.customerDetails.address,
          city: shipmentData.customerDetails.city,
          state: shipmentData.customerDetails.state,
          pin_code: shipmentData.customerDetails.pincode,
          phone: shipmentData.customerDetails.phone,
        },
        order_info: {
          order_value: shipmentData.orderDetails.totalValue,
          payment_mode: shipmentData.orderDetails.paymentType,
          cod_amount: shipmentData.orderDetails.codAmount || 0,
          products_desc: shipmentData.orderDetails.items.map(item => item.name).join(', '),
          hsn_code: "61091000", // Default HSN for textiles
          weight: shipmentData.orderDetails.totalWeight / 1000, // Convert to kg
          length: shipmentData.orderDetails.items[0]?.dimensions?.length || 10,
          breadth: shipmentData.orderDetails.items[0]?.dimensions?.width || 10,
          height: shipmentData.orderDetails.items[0]?.dimensions?.height || 5,
        },
      };

      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/shipments`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        return {
          success: true,
          shipmentId: response.data.data.shipment_id,
          trackingId: response.data.data.tracking_id,
          courierName: response.data.data.courier_name,
          estimatedDelivery: response.data.data.estimated_delivery,
          shippingCharges: response.data.data.shipping_charges,
        };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      return {
        success: false,
        shipmentId: '',
        trackingId: '',
        courierName: '',
        estimatedDelivery: '',
        shippingCharges: 0,
        error: error.message,
      };
    }
  }

  // Track Shipment
  async trackShipment(trackingId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/api/v1/shipments/track/${trackingId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );

      return {
        success: true,
        trackingId,
        status: response.data.data.status,
        statusCode: response.data.data.status_code,
        location: response.data.data.current_location,
        estimatedDelivery: response.data.data.estimated_delivery,
        history: response.data.data.tracking_history,
        courierName: response.data.data.courier_name,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Calculate Shipping Rates
  async calculateRates(shipmentData: Omit<ShipmentRequest, 'orderId'>): Promise<any> {
    try {
      const payload = {
        pickup_postcode: shipmentData.pickupDetails.pincode,
        delivery_postcode: shipmentData.customerDetails.pincode,
        weight: shipmentData.orderDetails.totalWeight / 1000,
        cod: shipmentData.orderDetails.paymentType === 'COD' ? 1 : 0,
        declared_value: shipmentData.orderDetails.totalValue,
      };

      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/courier/serviceability`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        rates: response.data.data.available_courier_companies.map((courier: any) => ({
          courierName: courier.courier_name,
          rate: courier.rate,
          estimatedDays: courier.estimated_delivery_days,
          codCharges: courier.cod_charges,
        })),
      };
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
      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/shipments/cancel`,
        {
          shipment_id: shipmentId,
          comment: reason,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: response.data.success,
        message: response.data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}