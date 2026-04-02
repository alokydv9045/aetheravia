// Order-to-3PL Integration Service
import { Courier3PLManager } from '@/lib/3pl/manager';
import { Shipment } from '@/lib/models/Shipment';
import OrderModel, { ORDER_STATUS, Order } from '@/lib/models/OrderModel';
import dbConnect from '@/lib/dbConnect';

// Initialize 3PL Manager
const courier3PL = new Courier3PLManager({
  deliveryCom: {
    apiKey: process.env.DELIVERY_COM_API_KEY || '',
    baseUrl: process.env.DELIVERY_COM_BASE_URL || 'https://api.delivery.com',
    environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
  },
  eCart: {
    apiKey: process.env.ECART_API_KEY || '',
    secretKey: process.env.ECART_SECRET_KEY || '',
    baseUrl: process.env.ECART_BASE_URL || 'https://api.ecart.com',
    environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
  },
  shippo: {
    apiKey: process.env.SHIPPO_API_KEY || '',
    baseUrl: process.env.SHIPPO_BASE_URL || 'https://api.goshippo.com/v1',
    environment: (process.env.NODE_ENV === 'production' ? 'live' : 'test') as 'test' | 'live',
  },
});

export interface OrderShipmentData {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress: {
    address: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    value: number;
    weight?: number;
  }>;
  totalValue: number;
  paymentMode: 'PREPAID' | 'COD';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  provider?: '3PL_DELIVERY_COM' | '3PL_E_CART' | '3PL_SHIPPO';
}

export class OrderShipmentService {
  
  /**
   * Automatically creates a shipment when order status changes to SHIPPED
   */
  static async handleOrderStatusChange(orderId: string, newStatus: string, oldStatus?: string) {
    try {
      await dbConnect();
      
      // Only create shipment when order moves to SHIPPED status
      if (newStatus !== ORDER_STATUS.SHIPPED) {
        return { success: true, message: 'No shipment action needed' };
      }
      
      // Check if shipment already exists
      const existingShipment = await Shipment.findOne({ orderId });
      if (existingShipment) {
        console.log('Shipment already exists for order:', orderId);
        return { success: true, shipmentId: existingShipment._id };
      }
      
      // Get order details
      const order = await OrderModel.findById(orderId).populate('user', 'name email');
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Create shipment data from order
      const shipmentData = await this.convertOrderToShipmentData(order);
      
      // Create shipment via 3PL
      const shipmentResult = await this.createShipmentFor3PL(shipmentData);
      
      if (shipmentResult.success && 'trackingId' in shipmentResult) {
        // Update order with tracking information
        await OrderModel.findByIdAndUpdate(orderId, {
          trackingNumber: shipmentResult.trackingId,
          carrierName: shipmentResult.courierName || '',
          estimatedDeliveryDate: shipmentResult.estimatedDelivery ? new Date(shipmentResult.estimatedDelivery) : undefined,
          $push: {
            timeline: {
              status: ORDER_STATUS.SHIPPED,
              timestamp: new Date(),
              description: `Shipment created with ${shipmentResult.provider}. Tracking ID: ${shipmentResult.trackingId}`,
              location: order.shippingAddress.city,
              updatedBy: 'SYSTEM',
              metadata: {
                provider: shipmentResult.provider,
                trackingId: shipmentResult.trackingId,
              },
            },
          },
        });
        
        console.log('Shipment created successfully:', shipmentResult.trackingId);
        return shipmentResult;
      } else {
        throw new Error(`Failed to create shipment: ${shipmentResult.error}`);
      }
      
    } catch (error: any) {
      console.error('Error in handleOrderStatusChange:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Convert order data to shipment format
   */
  private static async convertOrderToShipmentData(order: any): Promise<OrderShipmentData> {
    // Calculate total weight (estimate if not available)
    const estimatedWeight = order.items.reduce((total: number, item: any) => {
      // Default weight estimation: 0.5kg per item
      return total + (item.qty * 0.5);
    }, 0);
    
    // Determine payment mode
    const paymentMode = order.paymentMethod === 'COD' ? 'COD' : 'PREPAID';
    
    // Map items
    const items = order.items.map((item: any) => ({
      name: item.name,
      quantity: item.qty,
      value: item.price * item.qty,
      weight: 0.5, // Default weight per item
    }));
    
    return {
      orderId: order._id.toString(),
      customerName: order.shippingAddress.fullName,
      customerEmail: order.user?.email,
      customerPhone: order.user?.phone || '',
      shippingAddress: {
        address: order.shippingAddress.address,
        city: order.shippingAddress.city,
        state: '', // Add state mapping if available
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country || 'India',
      },
      items,
      totalValue: order.totalPrice,
      paymentMode,
      priority: order.priority || 'normal',
      provider: process.env.DEFAULT_3PL_PROVIDER as '3PL_DELIVERY_COM' | '3PL_E_CART' | '3PL_SHIPPO' || '3PL_SHIPPO',
    };
  }
  
  /**
   * Create shipment using 3PL service
   */
  static async createShipmentFor3PL(shipmentData: OrderShipmentData) {
    try {
      // Set default pickup address (your warehouse/store)
      const pickupAddress = {
        name: process.env.STORE_NAME || 'BellaModa Store',
        phone: process.env.STORE_PHONE || '+911234567890',
        address: process.env.STORE_ADDRESS || '123 Store Street',
        city: process.env.STORE_CITY || 'Mumbai',
        state: process.env.STORE_STATE || 'Maharashtra',
        zipCode: process.env.STORE_ZIP || '400001',
        country: process.env.STORE_COUNTRY || 'India',
      };
      
      // Calculate package dimensions (estimate)
      const packageDetails = {
        weight: shipmentData.items.reduce((total, item) => total + (item.weight || 0.5) * item.quantity, 0),
        length: 30, // Default dimensions
        width: 20,
        height: 10,
        declaredValue: shipmentData.totalValue,
        paymentMode: shipmentData.paymentMode,
      };
      
      // Create shipment request in correct format
      const shipmentRequest = {
        orderId: shipmentData.orderId,
        customerDetails: {
          name: shipmentData.customerName,
          address: shipmentData.shippingAddress.address,
          city: shipmentData.shippingAddress.city,
          state: shipmentData.shippingAddress.state || 'Unknown',
          pincode: shipmentData.shippingAddress.postalCode,
          phone: shipmentData.customerPhone || '',
          email: shipmentData.customerEmail || '',
        },
        orderDetails: {
          items: shipmentData.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            weight: item.weight || 0.5,
            price: item.value,
            dimensions: {
              length: 20,
              width: 15,
              height: 10,
            },
          })),
          totalWeight: packageDetails.weight,
          totalValue: shipmentData.totalValue,
          paymentType: shipmentData.paymentMode,
          codAmount: shipmentData.paymentMode === 'COD' ? shipmentData.totalValue : 0,
        },
        pickupDetails: {
          name: pickupAddress.name,
          address: pickupAddress.address,
          city: pickupAddress.city,
          state: pickupAddress.state,
          pincode: pickupAddress.zipCode,
          phone: pickupAddress.phone,
        },
        preferredCourier: shipmentData.provider?.replace('3PL_', '') as 'DELIVERY_COM' | 'E_CART' | 'SHIPPO' || 'SHIPPO',
      };
      
      // Create shipment via 3PL manager
      const result = await courier3PL.createShipment(shipmentRequest);
      
      return result;
      
    } catch (error: any) {
      console.error('Error creating 3PL shipment:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get shipment tracking information for an order
   */
  static async getOrderShipmentTracking(orderId: string) {
    try {
      await dbConnect();
      
      const shipment = await Shipment.findOne({ orderId });
      if (!shipment) {
        return { success: false, error: 'Shipment not found' };
      }
      
      // Get live tracking data
      const trackingResult = await courier3PL.trackShipment(shipment.trackingId, shipment.provider);
      
      return {
        success: true,
        data: {
          trackingId: shipment.trackingId,
          provider: shipment.provider,
          courierName: shipment.courierName,
          status: trackingResult.success ? trackingResult.status : shipment.status,
          currentLocation: trackingResult.success ? trackingResult.location : shipment.currentLocation,
          estimatedDelivery: trackingResult.success && trackingResult.estimatedDelivery 
            ? trackingResult.estimatedDelivery 
            : shipment.estimatedDelivery,
          trackingHistory: trackingResult.success && trackingResult.history 
            ? trackingResult.history 
            : shipment.trackingHistory,
          lastUpdated: new Date().toISOString(),
        },
      };
      
    } catch (error: any) {
      console.error('Error getting shipment tracking:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Sync shipment status back to order
   */
  static async syncShipmentStatusToOrder(trackingId: string) {
    try {
      await dbConnect();
      
      const shipment = await Shipment.findOne({ trackingId });
      if (!shipment) {
        return { success: false, error: 'Shipment not found' };
      }
      
      // Map shipment status to order status
      const statusMapping: { [key: string]: string } = {
        'CREATED': ORDER_STATUS.SHIPPED,
        'PICKED_UP': ORDER_STATUS.SHIPPED,
        'IN_TRANSIT': ORDER_STATUS.SHIPPED,
        'OUT_FOR_DELIVERY': ORDER_STATUS.OUT_FOR_DELIVERY,
        'DELIVERED': ORDER_STATUS.DELIVERED,
        'FAILED_DELIVERY': ORDER_STATUS.SHIPPED, // Keep as shipped, will retry
        'RETURNED': ORDER_STATUS.RETURNED,
        'CANCELLED': ORDER_STATUS.CANCELLED,
      };
      
      const orderStatus = statusMapping[shipment.status] || ORDER_STATUS.SHIPPED;
      
      // Update order status
      const order = await OrderModel.findById(shipment.orderId);
      if (order && order.status !== orderStatus) {
        order.status = orderStatus;
        
        // Add timeline event
        await order.addTimelineEvent(
          orderStatus,
          `Status updated from 3PL: ${shipment.status}`,
          {
            location: shipment.currentLocation,
            updatedBy: 'SYSTEM',
            metadata: {
              provider: shipment.provider,
              trackingId: shipment.trackingId,
              courierName: shipment.courierName,
            },
          }
        );
        
        // Set delivered date if delivered
        if (orderStatus === ORDER_STATUS.DELIVERED && !order.deliveredAt) {
          order.deliveredAt = shipment.actualDelivery || new Date();
          order.isDelivered = true;
        }
        
        await order.save();
        
        console.log(`Order ${shipment.orderId} status updated to ${orderStatus}`);
      }
      
      return { success: true, orderStatus, shipmentStatus: shipment.status };
      
    } catch (error: any) {
      console.error('Error syncing shipment status to order:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get all shipment analytics for orders
   */
  static async getShipmentAnalytics(dateRange?: { from: Date; to: Date }) {
    try {
      await dbConnect();
      
      const matchQuery: any = {};
      if (dateRange) {
        matchQuery.createdAt = { $gte: dateRange.from, $lte: dateRange.to };
      }
      
      // Get shipment statistics
      const shipmentStats = await Shipment.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalShipments: { $sum: 1 },
            deliveredCount: { $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] } },
            inTransitCount: { $sum: { $cond: [{ $in: ['$status', ['IN_TRANSIT', 'OUT_FOR_DELIVERY']] }, 1, 0] } },
            failedCount: { $sum: { $cond: [{ $in: ['$status', ['FAILED_DELIVERY', 'RETURNED', 'LOST', 'DAMAGED']] }, 1, 0] } },
            avgDeliveryTime: { $avg: '$avgDeliveryTimeHours' },
            totalShippingCost: { $sum: '$shippingCharges.total' },
          },
        },
      ]);
      
      // Get provider-wise statistics
      const providerStats = await Shipment.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$provider',
            count: { $sum: 1 },
            delivered: { $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] } },
            avgCost: { $avg: '$shippingCharges.total' },
            avgDeliveryTime: { $avg: '$avgDeliveryTimeHours' },
          },
        },
      ]);
      
      // Get daily shipment trend
      const dailyTrend = await Shipment.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            delivered: { $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      
      return {
        success: true,
        data: {
          overview: shipmentStats[0] || {
            totalShipments: 0,
            deliveredCount: 0,
            inTransitCount: 0,
            failedCount: 0,
            avgDeliveryTime: 0,
            totalShippingCost: 0,
          },
          providerStats,
          dailyTrend,
        },
      };
      
    } catch (error: any) {
      console.error('Error getting shipment analytics:', error);
      return { success: false, error: error.message };
    }
  }
}