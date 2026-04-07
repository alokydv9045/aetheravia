
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offers Management | Admin',
  description: 'Create, edit and schedule promotional offers, banners, popups and flash sales.'
};

export default function OffersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
