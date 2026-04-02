import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile - Aetheravia',
  description: 'Manage your Aetheravia account profile, orders, and preferences',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}