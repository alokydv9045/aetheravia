import React from 'react';

// Route-level layout for /admin/analytics
// Keep this as a simple pass-through so the page decides its own layout.
export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
