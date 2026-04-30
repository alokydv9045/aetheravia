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
    return 'orders';
  }
  
  const allowed = new Set([
    'dashboard', 'analytics', 'orders', 'products', 'coupons', 'users',
    'testimonials', 'referral', 'personalization',
    'offers', 'test-notifications', 'settings'
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
