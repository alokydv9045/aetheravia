import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/lib/models/OrderModel';
import ProductModel from '@/lib/models/ProductModel';

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await auth();
    if (!session?.user?._id) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { message: 'Order ID is required' },
        { status: 400 }
      );
    }



    // Find the original order and verify ownership
    const originalOrder = await OrderModel.findOne({
      _id: orderId,
      userId: session.user._id
    }).lean() as any;

    if (!originalOrder) {

      return NextResponse.json(
        { message: 'Order not found or access denied' },
        { status: 404 }
      );
    }



    // Determine which field contains the items
    let orderItems = originalOrder.items || originalOrder.orderItems || [];

    // Validate order structure
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      console.error('[REORDER] Invalid order structure:', { 
        orderId, 
        hasItems: !!originalOrder.items, 
        hasOrderItems: !!originalOrder.orderItems,
        itemsType: typeof originalOrder.items,
        orderItemsType: typeof originalOrder.orderItems,
        itemsLength: originalOrder.items?.length,
        orderItemsLength: originalOrder.orderItems?.length
      });
      return NextResponse.json(
        { message: 'Invalid order data structure - no items found' },
        { status: 400 }
      );
    }



    // Check product availability and get current prices
    const reorderItems = [];
    const unavailableItems = [];
    const priceChangedItems = [];

    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];


      // Get product ID from various possible fields
      const productId = item.product || item.productId || item._id;
      const quantity = item.qty || item.quantity || 1;

      if (!productId) {

        unavailableItems.push({
          name: item.name || 'Unknown Product',
          reason: 'Product ID not found'
        });
        continue;
      }

      const product = await ProductModel.findById(productId);
      
      if (!product) {

        unavailableItems.push({
          name: item.name || 'Unknown Product',
          reason: 'Product no longer available'
        });
        continue;
      }

      if (product.countInStock < quantity) {
        if (product.countInStock > 0) {
          // Partial availability
          reorderItems.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            originalPrice: item.price,
            quantity: product.countInStock,
            originalQuantity: quantity,
            image: product.image,
            slug: product.slug,
            countInStock: product.countInStock,
            priceChanged: product.price !== item.price,
            quantityReduced: true
          });
          
          if (product.price !== item.price) {
            priceChangedItems.push({
              name: product.name,
              originalPrice: item.price,
              currentPrice: product.price
            });
          }
        } else {
          unavailableItems.push({
            name: item.name || product.name,
            reason: 'Out of stock'
          });
        }
      } else {
        // Full availability
        reorderItems.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          originalPrice: item.price,
          quantity: quantity,
          originalQuantity: quantity,
          image: product.image,
          slug: product.slug,
          countInStock: product.countInStock,
          priceChanged: product.price !== item.price,
          quantityReduced: false
        });

        if (product.price !== item.price) {
          priceChangedItems.push({
            name: product.name,
            originalPrice: item.price,
            currentPrice: product.price
          });
        }
      }
    }

    // Calculate totals
    const itemsPrice = reorderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const originalItemsPrice = originalOrder.itemsPrice;



    return NextResponse.json({
      success: true,
      data: {
        originalOrder: {
          _id: originalOrder._id,
          createdAt: originalOrder.createdAt,
          totalPrice: originalOrder.totalPrice,
          itemsCount: orderItems.length
        },
        reorderItems,
        unavailableItems,
        priceChangedItems,
        summary: {
          totalItems: reorderItems.length,
          unavailableCount: unavailableItems.length,
          priceChangedCount: priceChangedItems.length,
          currentItemsPrice: itemsPrice,
          originalItemsPrice,
          priceDifference: itemsPrice - originalItemsPrice,
          canReorder: reorderItems.length > 0
        }
      }
    });

  } catch (error) {
    console.error('Reorder preparation error:', error);
    return NextResponse.json(
      { 
        message: 'Error preparing reorder',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Add items to cart for reorder
export async function PUT(request: NextRequest) {
  try {
    // Get user session
    const session = await auth();
    if (!session?.user?._id) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { items, clearCart = false } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { message: 'Invalid items data' },
        { status: 400 }
      );
    }

    // Here you would integrate with your cart system
    // For now, we'll return the cart data structure
    const cartItems = items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      slug: item.slug,
      countInStock: item.countInStock
    }));

    return NextResponse.json({
      success: true,
      message: clearCart ? 'Cart cleared and items added' : 'Items added to cart',
      data: {
        cartItems,
        itemCount: cartItems.length,
        totalPrice: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { message: 'Error adding items to cart' },
      { status: 500 }
    );
  }
}