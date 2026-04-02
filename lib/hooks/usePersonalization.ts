"use client";
import useSWR from 'swr';
import { z } from 'zod';

// Zod schemas for runtime safety (lenient if backend adds optional fields)
const ProductZ = z.object({
  _id: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  image: z.string(),
  price: z.number(),
  rating: z.number().optional(),
  numReviews: z.number().optional(),
  category: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

const CouponZ = z.object({
  _id: z.string().optional(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.string(),
  value: z.number(),
  expiryDate: z.string(),
  minimumOrderAmount: z.number().optional(),
  status: z.string(),
});

const ResponseZ = z.object({
  recommendations: z.array(ProductZ).default([]),
  coupons: z.array(CouponZ).default([]),
  topDeals: z.array(ProductZ).default([]),
  meta: z.any().optional(),
});

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Personalization ${res.status}: ${text || 'Failed'}`);
  }
  const json = await res.json();
  const parsed = ResponseZ.safeParse(json);
  if (!parsed.success) {
    console.warn('Personalization response validation failed', parsed.error.flatten());
    // Still return best-effort sanitized data
    return {
      recommendations: json.recommendations || [],
      coupons: json.coupons || [],
      topDeals: json.topDeals || [],
      meta: json.meta,
    };
  }
  return parsed.data;
};

export function usePersonalization() {
  const { data, error, isLoading, mutate } = useSWR('/api/user/personalization', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: true,
    errorRetryCount: 2,
  });

  return {
    recommendations: data?.recommendations ?? [],
    coupons: data?.coupons ?? [],
    topDeals: data?.topDeals ?? [],
    meta: data?.meta,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}
