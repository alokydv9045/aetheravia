import { redirect } from 'next/navigation';

export default function AdminShippingPage() {
  // Redirect to unified shipping management
  redirect('/admin/shipping/unified');
}