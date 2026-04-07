"use client";

import React from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import AdminLayout from './AdminLayout';

function mapSegmentToActive(seg: string | null): string {
  if (!seg) return 'dashboard';
  // Normalize segment names if needed
  const normalized = seg.replace(/\(.*\)/, '');
  
  // Handle nested segments like orders/advanced/unified
  if (normalized === 'orders') {
    // Check if we're on specific orders pages
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.includes('/orders/unified')) {
        return 'orders-unified';
      } else if (pathname.includes('/orders/advanced')) {
        return 'orders-advanced';
      }
    }
    return 'orders-advanced'; // Default to advanced orders
  }
  
  const allowed = new Set([
    'dashboard', 'analytics', 'orders-advanced', 'orders-unified', 'products', 'coupons', 'users',
    'carousel', 'testimonials', 'loyalty', 'referral', 'personalization',
    'offers', 'test-notifications'
  ]);
  return allowed.has(normalized) ? normalized : 'dashboard';
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment();
  const activeItem = mapSegmentToActive(segment);
  return (
    <AdminLayout activeItem={activeItem}>
      {children}
    </AdminLayout>
  );
}
