import { Metadata } from 'next';

import AdminCoupons from './AdminCoupons';

export const metadata: Metadata = {
  title: 'Coupon Management - Admin | AetherAvia',
  description: 'Manage discount coupons and promotional codes',
};

export default function CouponsPage() {
  return (
    <AdminCoupons />
  );
}
