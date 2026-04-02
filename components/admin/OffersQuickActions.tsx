"use client";

import Link from 'next/link';
import React from 'react';

/**
 * Client-only quick action buttons for the Offers admin page.
 * Isolated here so the server page component does not directly include event handlers.
 */
export default function OffersQuickActions() {
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className="btn btn-sm btn-outline"
        onClick={() => window.location.reload()}
      >
        Refresh Offers
      </button>
      <button
        type="button"
        className="btn btn-sm btn-outline"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        Back to Top
      </button>
      <Link className="btn btn-sm btn-outline" href="/admin/analytics">
        Performance Dashboard
      </Link>
    </div>
  );
}
