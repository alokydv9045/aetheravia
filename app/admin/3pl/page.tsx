import { redirect } from 'next/navigation';

export default function Admin3PLPage() {
  // Redirect to unified shipping management
  redirect('/admin/shipping/unified');
}