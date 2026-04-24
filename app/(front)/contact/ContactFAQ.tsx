"use client";

import React, { useState } from 'react';

const faqs = [
  {
    question: "How long does shipping typically take?",
    answer: "Orders within India typically arrive within 3-5 business days. International shipping takes between 7-14 business days depending on customs processing."
  },
  {
    question: "Are your ingredients ethically sourced?",
    answer: "Yes, we work directly with artisanal farmers and cooperatives across the subcontinent to ensure fair trade practices, sustainable harvesting, and complete transparency."
  },
  {
    question: "Can I get a personalized skin consultation?",
    answer: "Absolutely. You can schedule a virtual consultation with one of our herbalists through the 'Ritual Consultation' option in the contact form."
  },
  {
    question: "What is your return policy for artisanal soaps?",
    answer: "Due to the hygienic nature of our artisanal formulations, we only accept returns on unopened items within 14 days of receipt. Please contact our concierge for assistance."
  }
];

export default function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="group cursor-pointer" onClick={() => toggle(idx)}>
            <div className={`flex justify-between items-center pb-4 border-b transition-colors ${isOpen ? 'border-primary' : 'border-outline-variant/50 group-hover:border-primary'}`}>
              <h4 className={`text-lg font-headline transition-colors ${isOpen ? 'text-primary' : 'text-on-surface'}`}>
                {faq.question}
              </h4>
              <span 
                className="material-symbols-outlined text-secondary transition-all duration-300"
                style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
              >
                add
              </span>
            </div>
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 mt-4 mb-6' : 'max-h-0 opacity-0 m-0'}`}
            >
              <p className="text-secondary font-body leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
