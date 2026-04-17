import { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Privacy Policy | Aethravia Artisanal Heritage',
  description: 'Sanctuary of Data & Trust. How we safeguard the sanctity of your digital footprint with absolute transparency.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-surface text-on-surface selection:bg-secondary-container selection:text-on-secondary-container min-h-screen">
      <div className="noise-overlay fixed inset-0 pointer-events-none opacity-[0.03] -z-10"></div>
      
      <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <section className="mb-32 flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-4 text-primary font-label text-xs uppercase tracking-[0.4em] font-bold opacity-60">
                <span className="w-16 h-px bg-primary/30"></span>
                Ethical Stewardship
              </div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-headline text-on-surface leading-[1.05] tracking-tighter mb-10">
                Sanctuary of <br /><span className="italic text-primary font-light">Data &amp; Trust</span>
              </h1>
              <p className="text-xl md:text-2xl text-secondary leading-relaxed font-body font-light max-w-xl italic">
                Just as we preserve the ancient wisdom of herbal alchemy, we safeguard the sanctity of your digital footprint with absolute transparency.
              </p>
            </div>
            <div className="relative w-full md:w-[30%] aspect-[4/5] bg-surface-container-low overflow-hidden rounded-xl shadow-2xl group border border-outline-variant/10">
              <Image 
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="Sandalwood on a textured ceramic plate" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB33JJk-Lq7iiifgJSy8u86K8jLk_n4rywvtJUdQqHRZ_-EavcIGbAoY8Li6XvWchA9yBR8hHBamgj0YH3uZA1N1j4GlJSMVlUacgkufpmd4XelHDkhxRmQbyiLCLb0WgbrFsSGzp1gftWv4cJp362nuHQwnp9ZKcIC5Im1tB3B4o-CjajQIXwcca9PO_Q8eycjpjEyNUiTKvJIKh0CkIsIUXAyQNPOL39957jlHbNgK3Ygw9BEw9hH2wKZEInnpIo9kN2fBTwcnwKS"
              />
              <div className="absolute bottom-6 -left-6 bg-surface-container-lowest/90 backdrop-blur-xl p-8 shadow-xl border border-outline-variant/20 max-w-[220px] rounded-sm">
                <p className="font-headline text-primary text-base italic leading-relaxed">"The purity of our ingredients is matched only by the integrity of our promises."</p>
              </div>
            </div>
          </section>

          {/* Policy Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
            {/* Sticky Navigation Sidebar */}
            <aside className="lg:col-span-3 sticky top-32 hidden lg:block">
              <nav className="flex flex-col space-y-8 font-label">
                <Link className="group flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-primary border-l-2 border-primary pl-6 font-bold" href="#intro">
                  <span className="opacity-40">I.</span> Introduction
                </Link>
                <Link className="group flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-secondary hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary/30 pl-6" href="#collection">
                  <span className="opacity-40">II.</span> Information Collection
                </Link>
                <Link className="group flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-secondary hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary/30 pl-6" href="#usage">
                  <span className="opacity-40">III.</span> Ritual Curation
                </Link>
                <Link className="group flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-secondary hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary/30 pl-6" href="#tracking">
                  <span className="opacity-40">IV.</span> Cookies &amp; Pathing
                </Link>
                <Link className="group flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-secondary hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary/30 pl-6" href="#security">
                  <span className="opacity-40">V.</span> Secure Alchemy
                </Link>
                <Link className="group flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-secondary hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary/30 pl-6" href="#rights">
                  <span className="opacity-40">VI.</span> Your Rights
                </Link>
              </nav>
            </aside>

            {/* Main Content Area */}
            <article className="lg:col-span-9 space-y-40">
              {/* 01. Introduction */}
              <section className="scroll-mt-32" id="intro">
                <div className="flex items-center gap-6 mb-10">
                  <span className="text-[10px] font-bold font-label text-primary/40 tracking-[0.5em] border-b border-primary/20 pb-1 uppercase">Foundation</span>
                  <h2 className="text-4xl md:text-5xl font-headline tracking-tight">The Foundation of Consent</h2>
                </div>
                <div className="prose prose-stone max-w-none space-y-8 text-secondary font-body font-light text-lg leading-loose">
                  <p>At Aethravia, we believe privacy is not a mere compliance requirement, but a fundamental right of the modern individual. This document serves as our covenant with you—outlining how we honor the details you entrust to us during your journey through our artisanal collections.</p>
                  <p>By engaging with our platform, you are entering into a partnership of trust. We commit to using your information solely to enhance your sensory experience and deliver the physical manifestations of our heritage crafts.</p>
                </div>
              </section>

              {/* 02. Information Collection */}
              <section className="scroll-mt-32" id="collection">
                <div className="flex items-center gap-6 mb-12">
                  <span className="text-[10px] font-bold font-label text-primary/40 tracking-[0.5em] border-b border-primary/20 pb-1 uppercase">Elements</span>
                  <h2 className="text-4xl md:text-5xl font-headline tracking-tight">Essential Elements</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
                  <div className="bg-surface-container-low p-10 rounded-2xl border border-outline-variant/10 shadow-sm group">
                    <div className="w-14 h-14 bg-surface-container-high rounded-full flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors duration-500">
                      <span className="material-symbols-outlined text-primary text-3xl">person</span>
                    </div>
                    <h3 className="font-headline text-2xl mb-4">Personal Identity</h3>
                    <p className="text-base text-secondary/80 leading-relaxed font-body font-light">Your name, email address, and phone number—collected only to ensure our communication remains direct and personal.</p>
                  </div>
                  <div className="bg-surface-container-low p-10 rounded-2xl border border-outline-variant/10 shadow-sm group">
                    <div className="w-14 h-14 bg-surface-container-high rounded-full flex items-center justify-center mb-8 group-hover:bg-primary/10 transition-colors duration-500">
                      <span className="material-symbols-outlined text-primary text-3xl">local_shipping</span>
                    </div>
                    <h3 className="font-headline text-2xl mb-4">Logistics &amp; Delivery</h3>
                    <p className="text-base text-secondary/80 leading-relaxed font-body font-light">Your physical addresses required for the safe passage of our Body Wash, Sandalwood Scrub, and Face Wash rituals to your doorstep.</p>
                  </div>
                </div>
                <div className="relative bg-surface-container-highest p-16 rounded-3xl overflow-hidden border border-outline-variant/10 shadow-inner">
                  <div className="relative z-10 max-w-2xl">
                    <h4 className="font-headline text-2xl mb-6 italic text-primary">A Note on Ingredient Sensitivity</h4>
                    <p className="text-secondary leading-relaxed text-lg font-light">If you share skin concerns or ingredient preferences (such as a need for Multani Mitti or Chandan-based solutions), we treat this sensitive data with the same reverence as a master artisan treats their rarest resin.</p>
                  </div>
                  <span className="material-symbols-outlined absolute -right-12 -bottom-12 text-[15rem] text-primary/5 rotate-12 select-none pointer-events-none">ecg_heart</span>
                </div>
              </section>

              {/* 03. Ritual Curation */}
              <section className="scroll-mt-32" id="usage">
                <div className="flex items-center gap-6 mb-12">
                  <span className="text-[10px] font-bold font-label text-primary/40 tracking-[0.5em] border-b border-primary/20 pb-1 uppercase">Curation</span>
                  <h2 className="text-4xl md:text-5xl font-headline tracking-tight">Curating Your Rituals</h2>
                </div>
                <div className="flex flex-col xl:flex-row gap-20 items-start">
                  <div className="flex-1 space-y-10">
                    <p className="text-xl text-secondary leading-loose font-light italic">
                      We do not merely "process" data; we interpret it to curate a bespoke atmosphere for your self-care.
                    </p>
                    <ul className="space-y-10">
                      <li className="flex items-start gap-8 group">
                        <span className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-all">
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                        </span>
                        <div>
                          <h4 className="font-bold text-on-surface mb-2 font-headline uppercase tracking-wide">Personalized Guidance</h4>
                          <p className="text-secondary/80 font-light leading-relaxed">Tailoring product recommendations based on seasonal changes and your skin's unique heritage.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-8 group">
                        <span className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-all">
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                        </span>
                        <div>
                          <h4 className="font-bold text-on-surface mb-2 font-headline uppercase tracking-wide">Ethical Sourcing</h4>
                          <p className="text-secondary/80 font-light leading-relaxed">Understanding which artisanal regions resonate most with our community to refine our sourcing protocols.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-8 group">
                        <span className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-all">
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                        </span>
                        <div>
                          <h4 className="font-bold text-on-surface mb-2 font-headline uppercase tracking-wide">Flawless Execution</h4>
                          <p className="text-secondary/80 font-light leading-relaxed">Ensuring the secure and precise navigation of your rituals from our workshop to your sanctuary.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="w-full xl:w-96 aspect-square bg-surface-container-low rounded-3xl p-3 shadow-2xl border border-outline-variant/10">
                    <div className="relative w-full h-full rounded-2xl overflow-hidden group">
                      <Image 
                        fill
                        className="object-cover transition-transform duration-[2s] group-hover:scale-110" 
                        alt="Artisanal soap texture" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZhiPqmTESY6YM2vp3_LHN5tdM4UDseXlGav6dnAyDJ97WSiBiFFPYOYpqFPYMOcU2J3yRcCLKLJA1O5Ph1XIlbGQAMnzuZ8P8YK9m9RofZbTAM1ldbDyBiRBTYivgAEuY9UPtBdBuyWMtTJ7jjB15AHbC0cahSmgXVft7eVnCm7UXf6sPwOat9Mod_oFYRX6hWEwDw8-uHm3LVFKdUDw6GH80OoQvbMGGvwo1cAh4hv1D3FDAUp_HjtWhB9Zc3wMf1p00wvp1ZHpe"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* 04. Cookies & Pathing */}
              <section className="scroll-mt-32" id="tracking">
                <div className="flex items-center gap-6 mb-12">
                  <span className="text-[10px] font-bold font-label text-primary/40 tracking-[0.5em] border-b border-primary/20 pb-1 uppercase">Digital Track</span>
                  <h2 className="text-4xl md:text-5xl font-headline tracking-tight">Cookies &amp; Digital Pathing</h2>
                </div>
                <div className="bg-surface-container-low p-16 rounded-[2.5rem] border border-outline-variant/20 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32"></div>
                  <p className="text-xl text-secondary leading-loose font-light mb-12 max-w-3xl">
                    Our website uses "cookies"—small digital markers—to remember your preferences. This allows our virtual boutique to "recognize" you, recalling whether you prefer our Oud-based collections or our citrus-infused face washes.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {['Essential Cookies', 'Preference Memory', 'Analytical Pathing'].map(tag => (
                      <span key={tag} className="px-6 py-2 bg-primary/5 text-primary text-[10px] font-bold font-label rounded-full uppercase tracking-widest border border-primary/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {/* 05. Secure Alchemy */}
              <section className="scroll-mt-32" id="security">
                <div className="flex items-center gap-6 mb-12">
                  <span className="text-[10px] font-bold font-label text-primary/40 tracking-[0.5em] border-b border-primary/20 pb-1 uppercase">Security</span>
                  <h2 className="text-4xl md:text-5xl font-headline tracking-tight">Secure Alchemy</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="md:col-span-2 space-y-8 font-light text-lg text-secondary leading-loose">
                    <p>We employ "Secure Alchemy"—our internal term for high-grade encryption and rigorous security protocols. Your financial details never touch our servers; they are processed via encrypted gateways that exceed industry standards for safety.</p>
                    <p>Like a vault containing a precious attar, we restrict access to your information to only those few guardians necessary to fulfill your order.</p>
                  </div>
                  <div className="bg-primary p-12 text-on-primary rounded-3xl flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity"></div>
                    <span className="material-symbols-outlined text-6xl mb-6">encrypted</span>
                    <h4 className="font-bold uppercase tracking-widest text-xs mb-4">TLS 1.3 Encryption</h4>
                    <p className="text-[10px] opacity-70 tracking-widest font-label leading-relaxed px-4">Every byte of your data is shrouded in protective layers of mathematics.</p>
                  </div>
                </div>
              </section>

              {/* 06. Your Rights */}
              <section className="scroll-mt-32" id="rights">
                <div className="flex items-center gap-6 mb-16">
                  <span className="text-[10px] font-bold font-label text-primary/40 tracking-[0.5em] border-b border-primary/20 pb-1 uppercase">Agency</span>
                  <h2 className="text-4xl md:text-5xl font-headline tracking-tight">The Rights of the Individual</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="flex gap-10 items-start p-8 rounded-2xl hover:bg-surface-container-low transition-all duration-500 border border-transparent hover:border-outline-variant/10">
                    <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center flex-shrink-0 text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">visibility</span>
                    </div>
                    <div>
                      <h3 className="font-headline text-2xl mb-3">Right to Access</h3>
                      <p className="text-base text-secondary/80 leading-relaxed font-body font-light">Request a full inventory of the data we hold regarding your journey with Aethravia at any time.</p>
                    </div>
                  </div>
                  <div className="flex gap-10 items-start p-8 rounded-2xl hover:bg-surface-container-low transition-all duration-500 border border-transparent hover:border-outline-variant/10">
                    <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center flex-shrink-0 text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">edit_square</span>
                    </div>
                    <div>
                      <h3 className="font-headline text-2xl mb-3">Right to Rectify</h3>
                      <p className="text-base text-secondary/80 leading-relaxed font-body font-light">Correct any inaccuracies in your profile to ensure your rituals are delivered without delay.</p>
                    </div>
                  </div>
                  <div className="flex gap-10 items-start p-8 rounded-2xl hover:bg-surface-container-low transition-all duration-500 border border-transparent hover:border-outline-variant/10 md:col-span-2">
                    <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center flex-shrink-0 text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">auto_delete</span>
                    </div>
                    <div>
                      <h3 className="font-headline text-2xl mb-3">Right to Forget</h3>
                      <p className="text-base text-secondary/80 leading-relaxed font-body font-light">Request the complete dissolution of your records within our archive, should you choose to conclude your journey with us.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Footer */}
              <section className="pt-24 border-t border-outline-variant/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-surface-container-low/50 p-12 rounded-[2rem] border border-outline-variant/5">
                  <div className="max-w-md">
                    <h3 className="font-headline text-3xl mb-4 tracking-tight">Inquiries on Trust</h3>
                    <p className="text-secondary/70 text-lg font-light italic">Our Privacy Steward is available for any clarifications regarding your archival state.</p>
                  </div>
                  <Link className="px-12 py-5 bg-primary text-on-primary rounded-sm font-label text-xs font-bold uppercase tracking-[0.3em] hover:translate-y-[-2px] hover:shadow-2xl transition-all duration-300 flex items-center gap-3 group" href="mailto:privacy@aethravia.com">
                    <span className="material-symbols-outlined text-sm transition-transform group-hover:scale-125">mail</span>
                    Connect with our Steward
                  </Link>
                </div>
              </section>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
