'use client';

import React, { useState } from 'react';

const faqData = [
  {
    num: "01",
    question: "What is the shelf life of AetherAvia products?",
    answer: "Our formulations are crafted in small batches using raw, potent botanicals. To maintain the integrity of these artisanal blends, we recommend utilizing them within 12 months of opening. Store in a cool, dry place away from direct sunlight."
  },
  {
    num: "02",
    question: "Are these products suitable for sensitive skin?",
    answer: "Yes. AetherAvia was born from the need for gentle yet effective care. We utilize Multani Mitti (Fuller’s Earth) for its natural cooling and toxin-drawing properties, paired with Chandan (Sandalwood) to soothe inflammation. These ancient ingredients work in harmony to calm even the most reactive skin types."
  },
  {
    num: "03",
    question: "How should I use the 'Essential Three' ritual?",
    answer: "The 'Essential Three' follows a rhythmic progression: First, cleanse with our earthen wash; second, exfoliate gently with the Mitti Polish; and third, seal in moisture with our infused oils. It is a slow, tactile ritual meant to be practiced twice weekly for optimal skin restoration."
  },
  {
    num: "04",
    question: "Is your packaging sustainable?",
    answer: "Our commitment to the earth extends to our vessels. We use high-grade recyclable glass and biodegradable secondary packaging. Each element is designed to be repurposed, honoring the cycle of nature that provides our ingredients."
  },
  {
    num: "05",
    question: "Do you ship internationally?",
    answer: "We currently share our archive with enthusiasts across the globe. International shipping times vary depending on the destination, typically arriving within 10-14 business days via our carbon-neutral partners."
  },
  {
    num: "06",
    question: "Can I use the Mitti Polish on my face?",
    answer: "While specifically formulated for the body's thicker dermis, the Mitti Polish can be used as a targeted facial mask. Apply to oily areas (like the T-zone) for 5 minutes, then rinse gently without scrubbing to avoid over-exfoliation of delicate facial skin."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="pt-20 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Header */}
        <header className="text-center mb-24">
          <div className="flex justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-4xl opacity-60">potted_plant</span>
          </div>
          <h1 className="font-headline text-5xl md:text-6xl text-primary tracking-tight mb-4">Curated Inquiries</h1>
          <p className="font-body text-secondary max-w-lg mx-auto leading-relaxed">
            Seeking clarity on our artisanal rituals and earthen ingredients. A guide to the AetherAvia experience.
          </p>
        </header>

        {/* FAQ Accordion Layout */}
        <div className="space-y-0">
          {faqData.map((faq, index) => (
            <div key={index} className="group border-b-2 border-outline-variant/40 py-8">
              <button 
                onClick={() => toggleOpen(index)}
                className="w-full flex items-start text-left focus:outline-none"
                suppressHydrationWarning
              >
                <span className="font-headline text-lg text-primary/40 mr-6 pt-1">{faq.num}</span>
                <div className="flex-grow">
                  <h3 className="font-body font-semibold text-xl text-on-surface group-hover:text-primary transition-colors duration-300">
                    {faq.question}
                  </h3>
                  <div 
                    className={`mt-4 text-on-surface-variant leading-relaxed font-body max-w-5xl overflow-hidden transition-all duration-300 ${
                      openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    {faq.answer}
                  </div>
                </div>
                <span 
                  className={`material-symbols-outlined text-secondary ml-4 mt-1 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-45' : ''
                  } group-hover:text-primary`}
                >
                  add
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Asymmetric Editorial Image Section */}
        <section className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="bg-surface-container-high w-full aspect-[4/5] rounded-lg overflow-hidden shadow-sm">
              <img 
                alt="Artisanal clay pots and fresh sandalwood sticks" 
                className="w-full h-full object-cover opacity-90 mix-blend-multiply" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWj_gyBFX7jwujzY3WBQGc7inGam6YkBv_u5onlftBUcD6ubX5wb4oUn29bP29D59-rp0nhoj9vfwH4zs4xQbyo_R-ZBH0Y55yR6DYjjxqnoVIZgprcsVg85NTD1FSZHsQVKUxLByJ-CLMaSe4j7V_0EDDN19yYbiFSS_FiU_-HP2-KCXuATQqJxDs5LKgBWa9DFI-yP5o1NF1HtdNl-xMz7nuqz_dsPLZO-edIAzHZk6ukhIdOdxTrhBj2YFYaWBUp6yV9vYobIS3"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 bg-surface-container-lowest p-8 shadow-sm max-w-[240px]">
              <p className="font-headline italic text-primary text-lg">"The earth provides the cure, we simply provide the vessel."</p>
            </div>
          </div>
          <div className="md:pl-12 mt-12 md:mt-0">
            <h2 className="font-headline text-3xl text-secondary mb-6 leading-tight">Still have questions?</h2>
            <p className="font-body text-on-surface-variant mb-8">Our curators are available for personalized consultations regarding your skin ritual. Reach out to our heritage team for a deeper dive into our sourcing and ethos.</p>
            <button className="bg-primary text-on-primary px-8 py-4 rounded-lg font-label font-semibold tracking-wider hover:opacity-90 transition-opacity" suppressHydrationWarning>
              CONNECT WITH A CURATOR
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

