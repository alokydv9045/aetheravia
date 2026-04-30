import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import CouponModel from "@/lib/models/CouponModel";
import OrderModel, { OrderItem } from "@/lib/models/OrderModel";
import ProductModel from "@/lib/models/ProductModel";
import OfferModel from "@/lib/models/OfferModel";
import SettingModel from "@/lib/models/SettingModel";
import { emitAdminEvent } from "@/lib/eventBus";
import {
  sanitizeRequestBody,
  validateRequiredFields,
  validateNumeric,
} from "@/lib/security";
import { round2 } from "@/lib/utils"; 

// Utility: calculate prices
const calcPrices = (orderItems: OrderItem[], shippingCharge: number = 99) => {
  const itemsPrice = round2(
    orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );
  // Shipping Policy: Dynamic from settings
  const shippingPrice = round2(orderItems.length > 0 ? shippingCharge : 0);
  // Tax Policy: 18%
  const taxPrice = round2(Number(0.18 * itemsPrice));
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

export const POST = auth(async (req: any) => {
  if (!req.auth) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const user = req.auth.user;
  const safeUserId = user?._id || user?.id;

  // ✅ Ensure DB is connected before session
  await dbConnect();
  
  // Use session for transactions, but fall back to non-transactional if sessions aren't supported
  let session: mongoose.ClientSession | null = null;
  try {
    session = await mongoose.startSession();
  } catch (error) {
    console.warn("MongoDB sessions not supported, falling back to non-transactional flow");
    session = null;
  }

  // ✅ Read body once outside any potential retry loops
  const rawPayload = await req.json();
  const payload = sanitizeRequestBody(rawPayload);

  let createdOrder: any = null;
  
  // Helper to perform the actual order creation logic
  const performOrderCreation = async (currentSession: mongoose.ClientSession | null) => {
    
    // Fetch global shipping charge
    const shippingSetting = await SettingModel.findOne({ key: 'shipping_charge' }).session(currentSession);
    const dbShippingCharge = shippingSetting ? Number(shippingSetting.value) : 99;

    // Validate required fields
    const requiredFieldsCheck = validateRequiredFields(payload, [
      "items",
      "shippingAddress",
      "paymentMethod",
    ]);
    
    if (!requiredFieldsCheck.isValid) {
      throw new Error(`Missing required fields: ${requiredFieldsCheck.missingFields.join(", ")}`);
    }
    
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error("Your cart is empty. Please add items before placing an order.");
    }

    // Secondary validation for items
    for (const item of payload.items) {
      if (!item.slug || typeof item.slug !== "string") {
        throw new Error("Invalid item data: missing or invalid product slug");
      }
    }

    const slugs: string[] = payload.items.map((x: any) => x.slug);
    const dbProducts = await ProductModel.find(
      { slug: { $in: slugs } },
      "slug price countInStock name"
    ).session(currentSession);
    
    const productBySlug = new Map(dbProducts.map((p) => [p.slug, p]));
    const dbOrderItems: any[] = [];
    const stockUpdates: any[] = [];

    // Fetch active offers to apply discounts during order creation
    const now = new Date();
    const activeOffers = await OfferModel.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).session(currentSession).lean();

    for (const x of payload.items as any[]) {
      const p = productBySlug.get(x.slug);
      if (!p) {
        throw new Error(`Product not found: ${x.slug}`);
      }
      
      const qty = Number(x.qty);
      if (qty <= 0) throw new Error(`Invalid quantity for ${p.name}`);

      if (typeof p.countInStock === "number" && qty > p.countInStock) {
        throw new Error(
          `Insufficient stock for ${p.name}. Only ${p.countInStock} remaining.`
        );
      }

      // Calculate the best applicable offer price
      let actualPrice = p.price;
      const applicableOffers = activeOffers.filter(offer => 
        offer.products?.some((id: any) => id.toString() === p._id.toString())
      );

      if (applicableOffers.length > 0) {
        const bestOffer = applicableOffers.reduce((prev, current) => 
          (prev.discountPercentage || 0) > (current.discountPercentage || 0) ? prev : current
        );
        actualPrice = p.price * (1 - (bestOffer.discountPercentage || 0) / 100);
      }

      // Prepare order item with promotional price if applicable
      dbOrderItems.push({
        name: x.name || p.name,
        slug: x.slug,
        qty: qty,
        image: x.image,
        price: round2(actualPrice), // Use discounted price from offers
        color: x.color || 'Standard',
        size: x.size || 'Regular',
        product: p._id,
      });

      // Atomic stock update: only decrement if enough stock exists
      stockUpdates.push({
        updateOne: {
          filter: { _id: p._id, countInStock: { $gte: qty } },
          update: { $inc: { countInStock: -qty } },
        },
      });
    }

    const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calcPrices(dbOrderItems, dbShippingCharge);
    
    let finalTotalPrice = totalPrice;
    let couponInfo = null;

    // Handle Coupons
    if (payload.coupon?.code) {
      const coupon = await CouponModel.findOne({ code: payload.coupon.code }).session(currentSession);
      if (coupon && coupon.isActive) {
        const userOrders = await OrderModel.find({
          user: safeUserId,
          isPaid: true,
        }).session(currentSession);
        
        const validation = coupon.isValidForUser(safeUserId, totalPrice, userOrders, shippingPrice);
        if (validation.valid) {
          const discountAmount = coupon.calculateDiscount(totalPrice, shippingPrice);
          finalTotalPrice = Math.max(0, totalPrice - discountAmount);
          
          await coupon.applyCoupon(safeUserId, totalPrice, discountAmount);
          await coupon.save({ session: currentSession || undefined });
          
          couponInfo = {
            code: payload.coupon.code,
            name: payload.coupon.name,
            type: payload.coupon.type,
            discountAmount,
            originalOrderValue: totalPrice,
          };
        }
      }
    }

    const isCOD = payload.paymentMethod === 'cod';
    const advanceAmount = isCOD ? Math.round(finalTotalPrice * 0.2) : finalTotalPrice;
    const dueAmount = isCOD ? finalTotalPrice - advanceAmount : 0;

    const newOrderData = {
      items: dbOrderItems,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice: finalTotalPrice,
      advanceAmount,
      dueAmount,
      coupon: couponInfo,
      shippingAddress: payload.shippingAddress,
      paymentMethod: payload.paymentMethod,
      user: safeUserId,
      status: 'pending',
      isPaid: false,
      isDelivered: false,
    };

    const [order] = await OrderModel.create([newOrderData], { session: currentSession || undefined });
    
    if (stockUpdates.length > 0) {
      const bulkResult = await ProductModel.bulkWrite(stockUpdates, { session: currentSession || undefined });
      if (bulkResult.matchedCount < stockUpdates.length) {
        throw new Error("One or more items in your cart became unavailable. Please review your cart.");
      }
    }
    
    return order;
  };

  try {
    if (session) {
      // Try with transaction
      await session.withTransaction(async () => {
        createdOrder = await performOrderCreation(session);
      });
    } else {
      // Direct execution if sessions not supported
      createdOrder = await performOrderCreation(null);
    }

    return NextResponse.json(
      { message: "Order has been created", order: createdOrder },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[ORDER_API_ERROR]:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to place order. Please try again." },
      { status: 400 } // Use 400 for validation/business logic errors
    );
  } finally {
    if (session) session.endSession();
    
    if (createdOrder) {
      emitAdminEvent({
        type: 'order.created',
        ts: Date.now(),
        orderId: createdOrder._id?.toString?.(),
        total: createdOrder.totalPrice,
        userId: createdOrder.user?.toString?.(),
      });
    }
  }
});
