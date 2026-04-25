import { Metadata } from 'next';
import Link from 'next/link';
import { brandName, brandEmail } from '@/lib/brand';

export const metadata: Metadata = {
  title: `${brandName} Returns & Exchanges`,
  description: `Learn about ${brandName}'s returns and exchanges policy including eligibility, timelines, and how to start a return.`,
};

export default function ReturnsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Returns & Exchanges</h1>
      <p className="text-sm opacity-70 mb-6">
        Hassle-free returns within 7 days of delivery for unused items with original tags and packaging.
      </p>

      <div className="prose max-w-none">
        <h2>Eligibility</h2>
        <ul>
          <li>Items must be unused, unwashed, and with all original tags attached.</li>
          <li>Return request must be placed within 7 days of delivery.</li>
          <li>Final sale, hygiene-sensitive items, and gift cards are not eligible.</li>
        </ul>

        <h2>How to start a return</h2>
        <ol>
          <li>Go to <Link href="/order-history" className="link link-primary">Order History</Link> and select the order.</li>
          <li>Choose the item and reason for return/exchange.</li>
          <li>Schedule a pickup or drop at the nearest courier partner location.</li>
        </ol>

        <h2>Refunds</h2>
        <p>
          Refunds are processed to your original payment method within 3–7 business days after quality check. Store-credit refunds are instant once approved.
        </p>

        <h2>Exchanges</h2>
        <p>
          Exchange is subject to stock availability. If unavailable, we will process a refund.
        </p>

        <h2>Need help?</h2>
        <p>
          Email us at <a className="link" href={`mailto:${brandEmail}`}>{brandEmail}</a>.
        </p>
      </div>
    </main>
  );
}
