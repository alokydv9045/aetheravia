import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { OrderItem, ShippingAddress } from '../models/OrderModel';
import { round2 } from '../utils';

type Cart = {
  items: OrderItem[];
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;

  paymentMethod: string;
  shippingAddress: ShippingAddress;
  // Transient status for last cart action (e.g., out_of_stock)
  lastAction?: {
    code: 'out_of_stock' | 'invalid' | 'ok';
    message?: string;
  };
  
  // Coupon fields
  appliedCoupon?: {
    code: string;
    name: string;
    type: string;
    discountAmount: number;
    originalOrderValue: number;
    finalAmount: number;
  };
};

const initialState: Cart = {
  items: [],
  itemsPrice: 0,
  taxPrice: 0,
  shippingPrice: 0,
  totalPrice: 0,
  paymentMethod: 'Razorpay',
  shippingAddress: {
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  },
  appliedCoupon: undefined,
};

export const cartStore = create<Cart>()(
  persist(() => initialState, {
    name: 'cartStore',
    version: 2,
    migrate: (persisted: any, version) => {
      // Gracefully handle older shapes and ensure totals exist
      if (!persisted || typeof persisted !== 'object') return initialState;
      const state: Cart = {
        items: Array.isArray(persisted.items) ? persisted.items : [],
        itemsPrice: Number(persisted.itemsPrice) || 0,
        taxPrice: Number(persisted.taxPrice) || 0,
        shippingPrice: Number(persisted.shippingPrice) || 0,
        totalPrice: Number(persisted.totalPrice) || 0,
        paymentMethod: persisted.paymentMethod || 'Razorpay',
        shippingAddress: persisted.shippingAddress || initialState.shippingAddress,
        appliedCoupon: persisted.appliedCoupon,
        lastAction: { code: 'ok' },
      };
      // If totals are missing or zero but items exist, recalc
      if (state.items.length && (!state.itemsPrice && !state.totalPrice)) {
        const totals = calcPrice(state.items as any);
        state.itemsPrice = totals.itemsPrice;
        state.taxPrice = totals.taxPrice;
        state.shippingPrice = totals.shippingPrice;
        state.totalPrice = totals.totalPrice;
      }
      return state;
    },
    // Only persist essential fields; derived totals are persisted for quick hydration
    partialize: (state) => ({
      items: state.items,
      itemsPrice: state.itemsPrice,
      taxPrice: state.taxPrice,
      shippingPrice: state.shippingPrice,
      totalPrice: state.totalPrice,
      paymentMethod: state.paymentMethod,
      shippingAddress: state.shippingAddress,
      appliedCoupon: state.appliedCoupon,
    }),
  }),
);

const useCartService = () => {
  const {
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    shippingAddress,
    appliedCoupon,
    lastAction,
  } = cartStore();

  // Internal helper: revalidate coupon against server with current totals
  const revalidateAppliedCoupon = async (
    orderValue: number,
    shippingCost: number,
    code?: string,
  ) => {
    const couponCode = code || appliedCoupon?.code;
    if (!couponCode) return;
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode, orderValue, shippingCost }),
      });
      const data = await res.json();
      if (data?.valid) {
        // Keep minimal coupon snapshot aligned with Cart.appliedCoupon shape
        cartStore.setState({
          appliedCoupon: {
            code: data.coupon.code,
            name: data.coupon.name,
            type: data.coupon.type,
            discountAmount: data.discountAmount,
            originalOrderValue: orderValue,
            finalAmount: data.finalAmount,
          },
        });
      } else {
        // Remove coupon if no longer valid
        cartStore.setState({ appliedCoupon: undefined });
      }
    } catch (e) {
      // On network error, don't drop coupon immediately; consider keeping stale
      // No-op to keep UX resilient
    }
  };

  return {
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    shippingAddress,
    appliedCoupon,
    lastAction,
    increase: (item: OrderItem) => {
      const exist = items.find((x) => x.slug === item.slug);

      // Optional stock cap if item carries countInStock
      const countInStock = (exist as any)?.countInStock ?? (item as any)?.countInStock;
      const nextQty = (exist?.qty ?? 0) + 1;
      if (typeof countInStock === 'number' && nextQty > countInStock) {
        cartStore.setState({ lastAction: { code: 'out_of_stock', message: 'No more stock available for this item.' } });
        return;
      }

      const updatedCartItems = exist
        ? items.map((x) =>
            x.slug === item.slug ? { ...exist, qty: nextQty } : x,
          )
        : [...items, { ...(item as any), qty: 1 }];

      const { itemsPrice, shippingPrice, taxPrice, totalPrice } =
        calcPrice(updatedCartItems);
      cartStore.setState({
        items: updatedCartItems,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        lastAction: { code: 'ok' },
      });

      // Revalidate coupon if present
      if (cartStore.getState().appliedCoupon) {
        // Fire and forget
        revalidateAppliedCoupon(totalPrice, shippingPrice);
      }
    },
    decrease: (item: OrderItem) => {
      const exist = items.find((x) => x.slug === item.slug);
      if (!exist) return;

      const updatedCartItems =
        exist.qty === 1
          ? items.filter((x) => x.slug !== item.slug)
          : items.map((x) =>
              x.slug === item.slug ? { ...exist, qty: exist.qty - 1 } : x,
            );

      const { itemsPrice, shippingPrice, taxPrice, totalPrice } =
        calcPrice(updatedCartItems);
      cartStore.setState({
        items: updatedCartItems,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        lastAction: { code: 'ok' },
      });

      // Revalidate coupon if present
      if (cartStore.getState().appliedCoupon) {
        revalidateAppliedCoupon(totalPrice, shippingPrice);
      }
    },
    saveShippingAddress: (shippingAddress: ShippingAddress) => {
      cartStore.setState({
        shippingAddress,
      });
    },
    savePaymentMethod: (paymentMethod: string) => {
      cartStore.setState({
        paymentMethod,
      });
    },
    clear: () => {
      const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calcPrice([]);
      cartStore.setState({
        items: [],
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        appliedCoupon: undefined,
        lastAction: { code: 'ok' },
      });
    },
    init: () => cartStore.setState(initialState),
    
    // Coupon methods
    applyCoupon: (couponData: any) => {
      cartStore.setState({
        appliedCoupon: {
          code: couponData.coupon.code,
          name: couponData.coupon.name,
          type: couponData.coupon.type,
          discountAmount: couponData.discountAmount,
          originalOrderValue: totalPrice,
          finalAmount: couponData.finalAmount,
        },
      });
    },
    removeCoupon: () => {
      cartStore.setState({
        appliedCoupon: undefined,
      });
    },
    getFinalTotal: () => {
      return appliedCoupon ? appliedCoupon.finalAmount : totalPrice;
    },
  };
};

export default useCartService;

export const calcPrice = (items: OrderItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + item.price * item.qty, 0),
    ),
    shippingPrice = round2(itemsPrice > 2000 ? 0 : 200),
    taxPrice = round2(Number(0.18 * itemsPrice)),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};
