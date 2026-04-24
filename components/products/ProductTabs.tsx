'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Tab {
  id: string;
  label: string;
  title: string;
  content: string;
  image: string;
}

export default function ProductTabs({ description }: { description: string }) {
  const tabs: Tab[] = [
    {
      id: 'ritual',
      label: 'The Ritual',
      title: 'Cleansing as Meditation',
      content: 'Dispense a small amount onto your palm or a natural loofah. Massage onto damp skin in gentle circular motions, focusing on areas that hold tension. Inhale the grounding scent of sandalwood. Rinse with lukewarm water to reveal skin that feels soft, detoxified, and deeply nourished.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRSmWpCzGLgiS4xXmXgcabj9yx-1jx55OCHnwhDI3KqgH2AC44z2R07FpIInuLyJ7I4r6s6JSVjFP_LXmVVWBNjVTxxt5nA5rD4S21VwQUkW8jdtrSvyrLHXPYxV639zShq0Z99BvF5UqyfftFQJGSkv4TBKKzzLLgNxevvtTYnsjff9KUK0MtUGHeWc1Sh_yMDO05HjHhBZmd9BVWQtvR47azLXZo3mNeIPaTGYd2EVsEV_ByExW58R37rG_PJLipBo71W9uwSoEF'
    },
    {
      id: 'ingredients',
      label: 'Ingredients',
      title: 'Nature’s Raw Potency',
      content: 'Our formula is anchored by pure Sandalwood oil, known for its anti-inflammatory properties. We combine this with Multani Mitti (Fuller’s Earth) to draw out impurities, Reetha (Soapnut) for a gentle natural lather, and Wild Honey to lock in moisture. No synthetic fragrances, sulfates, or parabens.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXQhijcmtPtMf8skYc0_3R0py0Ztzsu7U-7gYyYozfnJWbJ782GjNXZhuf8kU9DIiu91Zn1SjEg54kCjAcuTm5iQJQOKMsS5fhwjfObBmBviJOChb0YVH8VhABREKOpV26o-LUGQgaj-jnmdvwJxjXgTRSkphNeXEBhz4689nZtVO-EHZ7Fgcht1PQ1Xu5xYAqeyaYFNff7SFz7akIyoMmA1pGqhMwt9kavFSnvCLy9ZNhJ8VhMWLg4hNaJNJw5-60g0KRiLuA2Qfo'
    },
    {
      id: 'ethics',
      label: 'Our Ethics',
      title: 'Conscious Craftsmanship',
      content: 'Aetheravia is built on the principle of Ahimsa (non-violence). Every ingredient is ethically sourced, supporting local cooperatives. Our packaging is 100% plastic-free, using infinitely recyclable glass and recycled paper. We never test on animals and ensure a fair wage for every hand in our supply chain.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATexIdksonwhogQUZmLLaNwoiJWqTCd7laB9bTaVBksXb-6twX9SSMXO89NyPvr6eOg7eXa8_4X9ZVH_wjapZ5mQhFo6GqZutv4lNQFnRr47G4K2-1qrl3mnem5iTr1WZunwusuupDI1urhf_XbHAl_Nh84Ose103uk6NqgBfkB-UQczvkqG5GuqyVeqJvphQPQxGxo8ylSNZpgM1OsHKQu3Qlu7s93SnOm7E1DrzbT55T5bNcFc4YuYDWXBmbtRbvO5nIWy8-TBX3'
    }
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <section className="mt-24 bg-surface-container-low relative py-20">
      <div className="absolute inset-0 pointer-events-none noise-overlay opacity-[0.03]"></div>
      <div className="max-w-4xl mx-auto px-6 relative">
        <div className="flex border-b border-outline-variant/20 mb-12 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab)}
              className={`px-8 pb-4 font-headline italic text-xl whitespace-nowrap transition-all duration-300 ${
                activeTab.id === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="space-y-12 transition-all duration-500">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
              <h2 className="font-headline text-3xl text-primary italic leading-tight">{activeTab.title}</h2>
              <p className="text-on-surface-variant leading-relaxed">
                {activeTab.content}
              </p>
            </div>
            <div className="rounded-lg overflow-hidden aspect-square shadow-xl animate-in fade-in slide-in-from-right-4 duration-700">
              <Image 
                src={activeTab.image}
                alt={activeTab.label}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
