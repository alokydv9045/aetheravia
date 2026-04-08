import React from 'react';
import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';
import { brandEmail } from '@/lib/brand';

type FAQ = {
  q: string;
  a: string;
  links?: { label: string; href: string }[];
};

const faqs: FAQ[] = [
  {
    q: 'What is AETHRAVIA 30-second skin care?',
    a: 'Our signature routine designed for busy lifestyles. It focuses on high-efficacy botanical ingredients that absorb rapidly and provide immediate hydration and protection in just 30 seconds.',
  },
  {
    q: 'Are your products only for women?',
    a: 'Not at all. AETHRAVIA products are formulated based on skin concerns, not gender. Our natural ingredients work effectively on all skin types.',
  },
  {
    q: 'Why should I prioritize natural skincare?',
    a: 'Natural skincare avoids harsh synthetic chemicals that can disrupt your skin\'s barrier. Botanical ingredients provide vitamins, antioxidants, and fatty acids that nourish without irritation.',
  },
  {
    q: 'Where are AETHRAVIA products made?',
    a: 'Our products are ethically manufactured in our state-of-the-art laboratory in India, using sustainably sourced ingredients from across the globe.',
  },
  {
    q: 'Is AETHRAVIA a Clean, Cruelty-free and Vegan brand?',
    a: 'Yes, we are 100% committed to being clean, cruelty-free, and vegan. We never test on animals and our formulations are free from toxins like parabens and sulfates.',
  },
  {
    q: 'How does AETHRAVIA ensure sustainability?',
    a: 'Sustainability is at our core. We use recyclable packaging, minimize water waste during production, and partner with local farmers for organic raw materials.',
  },
];

export default function FAQSection() {
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
    <section id="faqs" className="bg-white text-[#1a1a1a] py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-16 text-center md:text-left">
          <h2 className="text-2xl md:text-4xl font-medium tracking-tight leading-tight">
            You Have Questions...<br />
            We Have Answers!
          </h2>
        </div>

        <div className="space-y-0 border-t border-gray-200">
          {faqs.map((item, idx) => (
            <details key={idx} className="group border-b border-gray-200">
              <summary className="flex cursor-pointer list-none items-center justify-between py-8">
                <div className="flex items-center gap-8">
                  <span className="flex-shrink-0 w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-400 group-open:text-gray-900 group-open:border-gray-900 transition-colors">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="text-xl md:text-2xl font-normal group-open:font-medium transition-all">
                    {item.q}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center group-open:bg-[#2D4B3C] group-open:border-[#2D4B3C] transition-all">
                  <Plus className="h-5 w-5 text-gray-600 group-open:text-white group-open:rotate-45 transition-all duration-300" />
                </div>
              </summary>
              <div className="pb-8 pl-20 pr-12 text-lg text-gray-600 leading-relaxed font-light">
                {item.a}
                {item.links && item.links.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {item.links.map((lnk) => (
                      <Link
                        key={lnk.href + lnk.label}
                        href={lnk.href}
                        className="text-[#2D4B3C] hover:underline font-normal text-sm"
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

        <div className="mt-12 flex items-center justify-end">
          <Link href="/contact">
            <button className="flex items-center gap-4 bg-[#2D4B3C] text-white px-8 py-4 rounded-full hover:bg-[#1a2e25] transition-all group">
              <span className="text-sm font-medium">Go to Contact us</span>
              <div className="bg-[#1a2e25] group-hover:bg-[#2D4B3C] p-2 rounded-full transition-colors">
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
