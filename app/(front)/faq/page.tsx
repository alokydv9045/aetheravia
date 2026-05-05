'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const faqList = [
  {
    num: "01",
    question: "What is the expected shelf life of artisanal formulations?",
    answer: "Because we eschew harsh synthetic stabilizers, our rituals are active and potent. Generally, powders like our Multani Mitti base remain shelf-stable for 18–24 months if kept dry. Once hydrated, the ritual should be used immediately."
  },
  {
    num: "02",
    question: "How do you ensure the purity of Chandan and Reetha?",
    answer: "Our Sandalwood (Chandan) is sustainably harvested from protected groves in Karnataka, while our Soapnut (Reetha) is wild-crafted from the Himalayan foothills. Each batch undergoes rigorous testing for mineral density and botanical purity."
  },
  {
    num: "03",
    question: "The 'Essential Three' ritual instructions.",
    answer: "Begin with our Reetha infusion to cleanse, followed by the Multani-Chandan mask to detoxify. Conclude with a splash of cold spring water. We recommend this sequence twice weekly for restorative balance."
  },
  {
    num: "04",
    question: "Is your packaging fully biodegradable?",
    answer: "Yes. We utilize stone-paper labels and compostable mycelium-based protective casing. Our amber glass jars are designed for lifelong reuse within your home apothecary."
  },
  {
    num: "05",
    question: "International shipping and handling.",
    answer: "AetherAvia ships globally via carbon-neutral logistics. Due to the delicate nature of artisanal batches, please allow 7–12 days for international curation and delivery."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="pt-32 pb-24 bg-background text-on-surface">
      {/* Hero Section */}
      <header className="max-w-screen-xl mx-auto px-8 mb-24 md:flex items-end justify-between border-b border-outline-variant/20 pb-16">
        <div className="md:max-w-2xl">
          <h1 className="text-6xl md:text-7xl font-headline text-primary mb-6 tracking-tight">Curated Inquiries</h1>
          <p className="text-xl font-body text-on-surface-variant leading-relaxed max-w-lg">
            Seeking clarity on our artisanal rituals and earthen ingredients. A guide to our heritage-focused apothecary.
          </p>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-label-md font-label uppercase tracking-widest text-outline">Journal / Vol. 04</span>
        </div>
      </header>

      {/* FAQ Content (Numbered List) */}
      <section className="max-w-screen-xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left Sticky Navigation (Editorial feel) */}
          <aside className="md:col-span-3 hidden md:block">
            <nav className="sticky top-40 space-y-6">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Categories</div>
              <ul className="space-y-4 font-label text-sm">
                <li className="text-primary font-bold">The Basics</li>
                <li className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Sourcing & Ingredients</li>
                <li className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Ritual Usage</li>
                <li className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Logistics</li>
              </ul>
            </nav>
          </aside>

          {/* FAQ Items */}
          <div className="md:col-span-9 space-y-12">
            {faqList.map((faq, index) => (
              <div key={index} className="group border-b border-outline-variant/10 pb-12">
                <div 
                  className="flex items-baseline gap-8 cursor-pointer"
                  onClick={() => toggleOpen(index)}
                >
                  <span className="font-headline text-2xl text-primary/40 group-hover:text-primary transition-colors">
                    {faq.num}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-2xl font-headline text-on-surface group-hover:text-primary transition-colors mb-4">
                      {faq.question}
                    </h3>
                    <div 
                      className={`max-w-2xl overflow-hidden transition-all duration-500 ease-in-out ${
                        openIndex === index ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <p className="text-on-surface-variant leading-relaxed font-body">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                  <span 
                    className={`material-symbols-outlined text-outline transition-transform duration-300 ${
                      openIndex === index ? 'rotate-45 text-primary' : 'group-hover:rotate-45'
                    }`}
                  >
                    add
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-screen-xl mx-auto px-8 mt-48">
        <div className="bg-surface-container-low rounded-lg p-12 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-4xl md:text-5xl font-headline text-primary mb-6">Still have questions?</h2>
            <p className="text-on-surface-variant mb-10 text-lg">
              Our curators are available to guide you through ingredient profiles, skin-typing, and traditional ritual application.
            </p>
            <Link href="mailto:heukcare@gmail.com">
              <button className="bg-primary text-on-primary px-10 py-5 rounded-lg font-label uppercase tracking-widest text-sm hover:bg-primary-container transition-all hover:scale-[1.02] active:scale-95">
                Connect with a Curator
              </button>
            </Link>
          </div>

          {/* Artistic Inset Image */}
          <div className="relative w-full md:w-1/3 aspect-[4/5]">
            <div className="absolute -top-8 -left-8 w-full h-full bg-outline-variant/10 rounded-lg -z-10 translate-x-4 translate-y-4"></div>
            <img 
              alt="Raw earth and wooden tools" 
              className="w-full h-full object-cover rounded-lg shadow-sm" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlzPo1u9pEZTr30k6eD3OkbfkqZY-i_alCaW-IOsqYu4QYKFn_-B2o4tbk3Lqe7Cl7Si17Ad5qs308Z_STzjn4amvuZiabQKqufpYjM0LzbsPhQoOZ1Tjf5YrKTYfLB8Y1CrLlJmYFn-JsqVZ1DOZQdgc6X5lE_wh7n9-bqoGINyOmHoyByhsclgq2TTLPN7gC_vUxyUkFF8NVVJg0fTI5-ElMPQBmAqK1-bfMr1PGDSvrrMK-43yJCC7iMSLXXnIw8soEL9Y-3eeR"
            />
            <div className="absolute -bottom-4 -right-4 p-4 bg-surface-container-lowest shadow-sm rounded-lg max-w-[160px]">
              <p className="text-[10px] font-headline italic text-primary leading-tight">
                "Ingredients sourced from the earth, returned to the skin."
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

