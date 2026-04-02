// API endpoint to create demo order for 3PL testing
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/lib/models/OrderModel';
import UserModel from '@/lib/models/UserModel';

export async function POST() {
  try {
    await dbConnect();
    
    // Check if demo user exists, create if not
    let demoUser = await UserModel.findOne({ email: 'demo@bellamoda.com' });
    if (!demoUser) {
      demoUser = new UserModel({
        name: 'Demo Customer',
        email: 'demo@bellamoda.com',
        password: 'demo_password_hash', // In real app, this would be properly hashed
        isAdmin: false,
      });
      await demoUser.save();
    }
    
    // Create demo order
    const demoOrder = new OrderModel({
      user: demoUser._id,
      items: [
        {
          name: 'Demo Fashion Dress',
          slug: 'demo-fashion-dress',
          qty: 1,
          image: '/images/demo-dress.jpg',
          price: 1499,
          color: 'Blue',
          size: 'M',
        },
        {
          name: 'Demo Accessories Set',
          slug: 'demo-accessories-set',
          qty: 2,
          image: '/images/demo-accessories.jpg',
          price: 599,
          color: 'Black',
          size: 'One Size',
        },
      ],
      shippingAddress: {
        fullName: 'Demo Customer',
        address: '456 Customer Avenue, Block A',
        city: 'Delhi',
        postalCode: '110001',
        country: 'India',
      },
      paymentMethod: 'Prepaid',
      paymentResult: {
        id: 'demo_payment_123',
        status: 'PAID',
        email_address: 'demo@bellamoda.com',
      },
      itemsPrice: 2697, // 1499 + (599 * 2)
      shippingPrice: 0, // Free shipping over 100
      taxPrice: 404.55, // 15% tax
      totalPrice: 3101.55,
      isPaid: true,
      paidAt: new Date(),
      status: 'confirmed',
      priority: 'normal',
    });
    
    await demoOrder.save();
    
    return NextResponse.json({
      success: true,
      orderId: demoOrder._id,
      message: 'Demo order created successfully',
      order: {
        id: demoOrder._id,
        customer: demoOrder.shippingAddress.fullName,
        total: demoOrder.totalPrice,
        status: demoOrder.status,
        items: demoOrder.items.length,
      },
    });
    
  } catch (error: any) {
    console.error('Error creating demo order:', error);
    return NextResponse.json(
      { error: 'Failed to create demo order', details: error.message },
      { status: 500 }
    );
  }
}