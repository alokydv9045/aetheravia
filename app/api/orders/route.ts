import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import CouponModel from "@/lib/models/CouponModel";
import OrderModel, { OrderItem } from "@/lib/models/OrderModel";
import ProductModel from "@/lib/models/ProductModel";
import { emitAdminEvent } from "@/lib/eventBus";
import {
  sanitizeRequestBody,
  validateRequiredFields,
  validateNumeric,
} from "@/lib/security";
import { round2 } from "@/lib/utils";

// Utility: calculate prices
const calcPrices = (orderItems: OrderItem[]) => {
  const itemsPrice = round2(
    orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );
  const shippingPrice = round2(itemsPrice > 100 ? 0 : 10);
  const taxPrice = round2(Number((0.15 * itemsPrice).toFixed(2)));
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
  const session = await mongoose.startSession();

  let createdOrder: any = null;
  try {
    await session.withTransaction(async () => {
      try {
        const rawPayload = await req.json();
        const payload = sanitizeRequestBody(rawPayload);
        // Validate required fields
        const requiredFieldsCheck = validateRequiredFields(payload, [
          "items",
          "shippingAddress",
          "paymentMethod",
        ]);
        if (!requiredFieldsCheck.isValid) {
          throw new Error(
            `Missing required fields: ${requiredFieldsCheck.missingFields.join(", ")}`
          );
        }
        if (!Array.isArray(payload.items) || payload.items.length === 0) {
          throw new Error("Cart is empty or invalid");
        }
        for (const item of payload.items) {
          if (!item.slug || typeof item.slug !== "string") {
            throw new Error("Invalid item data: missing or invalid slug");
          }
          if (!validateNumeric(item.qty, 1, 100)) {
            throw new Error(`Invalid quantity for item ${item.slug}`);
          }
        }
        const slugs: string[] = payload.items.map(
          (x: OrderItem & { slug: string }) => x.slug
        );
        const dbProducts = await ProductModel.find(
          { slug: { $in: slugs } },
          "slug price countInStock"
        ).session(session);
        const productBySlug = new Map(dbProducts.map((p) => [p.slug, p]));
        const dbOrderItems: (OrderItem & { product: any })[] = [];
        const stockUpdates: any[] = [];
        for (const x of payload.items as (OrderItem & { slug: string; qty: number })[]) {
          const p = productBySlug.get(x.slug);
          if (!p) {
            throw new Error(`Product not found: ${x.slug}`);
          }
          const qty = Number(x.qty);
          if (!Number.isInteger(qty) || qty <= 0 || qty > 100) {
            throw new Error(
              `Invalid quantity for ${x.slug}: must be between 1 and 100`
            );
          }
          if (typeof p.countInStock === "number" && qty > p.countInStock) {
            throw new Error(
              `Insufficient stock for ${x.slug}. Available: ${p.countInStock}, Requested: ${qty}`
            );
          }
          dbOrderItems.push({
            ...(x as any),
            product: (p as any)._id,
            price: (p as any).price,
            qty,
            _id: undefined as any,
          });
          stockUpdates.push({
            updateOne: {
              filter: { _id: p._id },
              update: { $inc: { countInStock: -qty } },
            },
          });
        }
        const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calcPrices(
          dbOrderItems as OrderItem[]
        );
        let finalTotalPrice = totalPrice;
        let couponInfo = null;
        if (payload.coupon?.code) {
          const coupon = await CouponModel.findOne({
            code: payload.coupon.code,
          }).session(session);
          if (coupon && coupon.isActive) {
            const userOrders = await OrderModel.find({
              user: safeUserId,
              isPaid: true,
            }).session(session);
            const validation = coupon.isValidForUser(
              safeUserId,
              totalPrice,
              userOrders
            );
            if (validation.valid) {
              const discountAmount = coupon.calculateDiscount(
                totalPrice,
                shippingPrice
              );
              finalTotalPrice = Math.max(0, totalPrice - discountAmount);
              await coupon.applyCoupon(safeUserId, totalPrice, discountAmount);
              await coupon.save({ session });
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
        const newOrderData = {
          items: dbOrderItems,
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice: finalTotalPrice,
          coupon: couponInfo,
          shippingAddress: payload.shippingAddress,
          paymentMethod: payload.paymentMethod,
          user: safeUserId,
        };
        const [order] = await OrderModel.create([newOrderData], { session });
        createdOrder = order;
        if (stockUpdates.length > 0) {
          await ProductModel.bulkWrite(stockUpdates, { session });
        }
      } catch (err: any) {
        console.error("Order creation transaction error:", err);
        throw err;
      }
    });
    return NextResponse.json(
      { message: "Order has been created", order: createdOrder },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Order creation error (outer):", err);
    return NextResponse.json(
      { message: err?.message || "Failed to create order. Please try again." },
      { status: 500 }
    );
  } finally {
    session.endSession();
    if (createdOrder) {
      // Fire realtime event post-transaction
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
