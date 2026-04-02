import React from 'react';
import Link from 'next/link';
import { brandEmail, brandName } from '@/lib/brand';

type FAQ = {
  q: string;
  a: string;
  links?: { label: string; href: string }[];
};

const faqs: FAQ[] = [
  {
    q: 'What are the shipping timelines?',
    a: 'Most orders are processed within 24–48 hours. Delivery typically takes 3–7 business days depending on your location.',
    links: [
      { label: 'Shipping & Delivery', href: '/shipping' },
    ],
  },
  {
    q: 'How can I track my order?',
    a: 'Once shipped, you’ll receive a tracking number via email/SMS. You can also track from your Order History page or our Track page using the AWB.',
    links: [
      { label: 'Order History', href: '/order-history' },
      { label: 'Track Shipment', href: '/track' },
    ],
  },
  {
    q: 'What is your return & exchange policy?',
    a: 'Hassle-free returns within 7 days of delivery for unused items with tags. Exchanges are subject to stock availability.',
    links: [
      { label: 'Returns & Exchanges', href: '/returns' },
    ],
  },
  {
    q: 'Which payment methods are accepted?',
    a: 'We support major cards, UPI/wallets, NetBanking, and Razorpay. Cash on Delivery may be available on eligible orders.',
    links: [
      { label: 'Payment & Checkout', href: '/payment' },
    ],
  },
  {
    q: 'Do you have a size guide?',
    a: 'Yes! Size charts are available on each product page. If you’re unsure, our support team can help with fit advice.',
  },
  {
    q: 'How do I contact customer support?',
    a: `Reach us at ${brandEmail} or call ${process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+91-XXXX-XXXXXX'}. We're available Mon–Sat, 10am–7pm IST.`,
    links: [
      { label: `Email ${brandName}`, href: `mailto:${brandEmail}` },
      { label: 'Call support', href: `tel:${process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+91-XXXX-XXXXXX'}` },
    ],
  },
];

export default function FAQSection() {
  // Build FAQPage JSON-LD schema from visible content
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  } as const;

  return (
    <section id="faqs" className="bg-base-200 text-base-content">
      <script
        type="application/ld+json"
        // Expose structured data for SEO; mirrors the content below
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="container mx-auto px-4 py-10 sm:py-14">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="mt-2 text-sm sm:text-base opacity-70">Quick answers to common questions about orders, delivery, and returns.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {faqs.map((item, idx) => (
            <details key={idx} className="group rounded-lg border border-base-300 bg-base-100 p-4 open:bg-base-100 open:shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <span className="font-medium">{item.q}</span>
                <svg
                  className="h-5 w-5 transition-transform duration-200 group-open:rotate-180"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                </svg>
              </summary>
              <div className="mt-3 text-sm opacity-80 leading-relaxed">
                {item.a}
                {item.links && item.links.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.links.map((lnk) => (
                      <Link
                        key={lnk.href + lnk.label}
                        href={lnk.href}
                        className="link link-primary text-primary"
                      >
                        {lnk.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
