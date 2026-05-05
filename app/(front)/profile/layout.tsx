import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile - AetherAvia',
  description: 'Manage your AetherAvia account profile, orders, and preferences',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}