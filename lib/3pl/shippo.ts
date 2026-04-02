// Shippo 3PL Integration Service
interface ShippoConfig {
  apiKey: string;
  baseUrl: string;
  environment: 'test' | 'live';
}

interface ShippoShipmentRequest {
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

interface ShippoResponse {
  success: boolean;
  shipmentId: string;
  trackingId: string;
  courierName: string;
  estimatedDelivery: string;
  shippingCharges: number;
  error?: string;
}

export class ShippoService {
  private config: ShippoConfig;

  constructor(config: ShippoConfig) {
    this.config = config;
  }

  // Create Address Object for Shippo
  private createAddress(details: any, type: 'from' | 'to') {
    return {
      name: details.name,
      street1: details.address,
      city: details.city,
      state: details.state || 'Unknown',
      zip: details.pincode,
      country: 'IN', // India
      phone: details.phone,
      email: details.email || '',
    };
  }

  // Create Parcel Object for Shippo
  private createParcel(orderDetails: any) {
    // Convert grams to pounds (Shippo uses pounds)
    const weightInPounds = orderDetails.totalWeight / 453.592;
    
    // Get dimensions from first item or use defaults
    const firstItem = orderDetails.items[0];
    const dimensions = firstItem?.dimensions || { length: 10, width: 10, height: 5 };
    
    return {
      length: dimensions.length.toString(),
      width: dimensions.width.toString(),
      height: dimensions.height.toString(),
      distance_unit: 'cm',
      weight: weightInPounds.toFixed(2),
      mass_unit: 'lb',
    };
  }

  // Create Shipment
  async createShipment(shipmentData: ShippoShipmentRequest): Promise<ShippoResponse> {
    try {
      // Step 1: Create Address Objects
      const addressFrom = this.createAddress(shipmentData.pickupDetails, 'from');
      const addressTo = this.createAddress(shipmentData.customerDetails, 'to');
      const parcel = this.createParcel(shipmentData.orderDetails);

      // Step 2: Create Shipment in Shippo
      const shipmentPayload = {
        address_from: addressFrom,
        address_to: addressTo,
        parcels: [parcel],
        async: false, // Get rates immediately
      };

      const shipmentResponse = await fetch(`${this.config.baseUrl}/shipments/`, {
        method: 'POST',
        headers: {
          'Authorization': `ShippoToken ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shipmentPayload),
      });

      const shipmentData_response = await shipmentResponse.json();

      if (!shipmentResponse.ok) {
        throw new Error(shipmentData_response.detail || 'Failed to create shipment');
      }

      // Step 3: Select the cheapest rate (or first available)
      const rates = shipmentData_response.rates;
      if (!rates || rates.length === 0) {
        throw new Error('No shipping rates available');
      }

      // Find cheapest rate
      const selectedRate = rates.reduce((cheapest: any, current: any) => {
        return parseFloat(current.amount) < parseFloat(cheapest.amount) ? current : cheapest;
      }, rates[0]);

      // Step 4: Purchase the shipping label
      const transactionPayload = {
        rate: selectedRate.object_id,
        label_file_type: 'PDF',
        async: false,
      };

      const transactionResponse = await fetch(`${this.config.baseUrl}/transactions/`, {
        method: 'POST',
        headers: {
          'Authorization': `ShippoToken ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionPayload),
      });

      const transactionData = await transactionResponse.json();

      if (!transactionResponse.ok) {
        throw new Error(transactionData.detail || 'Failed to purchase label');
      }

      return {
        success: true,
        shipmentId: shipmentData_response.object_id,
        trackingId: transactionData.tracking_number,
        courierName: selectedRate.provider,
        estimatedDelivery: selectedRate.estimated_days 
          ? new Date(Date.now() + selectedRate.estimated_days * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 7 days
        shippingCharges: parseFloat(selectedRate.amount),
      };

    } catch (error: any) {
      console.error('Shippo createShipment error:', error);
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
  async trackShipment(trackingNumber: string, carrier?: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/tracks/${carrier || 'usps'}/${trackingNumber}/`, {
        method: 'GET',
        headers: {
          'Authorization': `ShippoToken ${this.config.apiKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to track shipment');
      }

      return {
        success: true,
        trackingNumber,
        status: data.tracking_status?.status || 'UNKNOWN',
        statusCode: data.tracking_status?.status_code || '',
        location: data.tracking_status?.location || '',
        estimatedDelivery: data.eta,
        courierName: carrier || data.carrier,
        history: data.tracking_history?.map((event: any) => ({
          timestamp: event.status_date,
          status: event.status,
          location: event.location,
          description: event.status_details,
        })) || [],
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Calculate Shipping Rates
  async calculateRates(shipmentData: Omit<ShippoShipmentRequest, 'orderId'>): Promise<any> {
    try {
      const addressFrom = this.createAddress(shipmentData.pickupDetails, 'from');
      const addressTo = this.createAddress(shipmentData.customerDetails, 'to');
      const parcel = this.createParcel(shipmentData.orderDetails);

      const shipmentPayload = {
        address_from: addressFrom,
        address_to: addressTo,
        parcels: [parcel],
        async: false,
      };

      const response = await fetch(`${this.config.baseUrl}/shipments/`, {
        method: 'POST',
        headers: {
          'Authorization': `ShippoToken ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shipmentPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to get rates');
      }

      return {
        success: true,
        rates: data.rates?.map((rate: any) => ({
          provider: rate.provider,
          serviceName: rate.servicelevel.name,
          rate: parseFloat(rate.amount),
          currency: rate.currency,
          estimatedDays: rate.estimated_days,
          duration: rate.duration_terms,
        })) || [],
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Cancel Shipment (Refund)
  async cancelShipment(transactionId: string, reason: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/transactions/${transactionId}/refund/`, {
        method: 'POST',
        headers: {
          'Authorization': `ShippoToken ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          async: false,
        }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        message: response.ok ? 'Refund requested successfully' : (data.detail || 'Refund failed'),
        refundStatus: data.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get Label URL
  async getLabelUrl(transactionId: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.config.baseUrl}/transactions/${transactionId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `ShippoToken ${this.config.apiKey}`,
        },
      });

      const data = await response.json();
      return data.label_url || null;
    } catch (error) {
      console.error('Failed to get label URL:', error);
      return null;
    }
  }
}