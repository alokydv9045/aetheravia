import { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Terms & Conditions | AetherAvia Artisanal Heritage',
  description: 'The digital sanctuary terms of service for AetherAvia. Respecting the archive, the craft, and the ritual.',
};

export default function TermsPage() {
  return (
    <div className="bg-surface text-on-surface selection:bg-secondary-container selection:text-on-secondary-container min-h-screen">
      <div className="noise-overlay fixed inset-0 pointer-events-none opacity-[0.03] -z-10"></div>
      
      {/* Hero Header */}
      <header className="pt-32 pb-16 px-8 max-w-screen-xl mx-auto text-center">
        <span className="font-body text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-6 block opacity-60">Legal Repository</span>
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-on-surface mb-8">Terms &amp; Conditions</h1>
        <p className="font-serif italic text-lg text-secondary max-w-2xl mx-auto leading-relaxed">
          Respecting the archive, the craft, and the ritual. By engaging with AetherAvia, you honor the lineage of artisanal heritage.
        </p>
      </header>

      <main className="max-w-screen-xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 pb-32">
        {/* Sidebar Navigation (Sticky) */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-32 h-fit">
          <div className="bg-surface-container-low p-8 border-l-2 border-primary/20 rounded-sm">
            <h3 className="font-headline font-bold text-lg mb-6">Archive Sections</h3>
            <ul className="space-y-4">
              <li><Link className="text-sm font-body text-secondary hover:text-primary transition-colors block" href="#acceptance">Acceptance of Terms</Link></li>
              <li><Link className="text-sm font-body text-secondary hover:text-primary transition-colors block" href="#products">Artisanal Products</Link></li>
              <li><Link className="text-sm font-body text-secondary hover:text-primary transition-colors block" href="#payments">Ordering &amp; Payments</Link></li>
              <li><Link className="text-sm font-body text-secondary hover:text-primary transition-colors block" href="#shipping">Heritage Shipping</Link></li>
              <li><Link className="text-sm font-body text-secondary hover:text-primary transition-colors block" href="#returns">Ritual Cancellation</Link></li>
              <li><Link className="text-sm font-body text-secondary hover:text-primary transition-colors block" href="#intellectual">Ancient Wisdom</Link></li>
            </ul>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <div className="lg:col-span-9 space-y-24">
          {/* Section 1: Acceptance */}
          <section className="scroll-mt-32" id="acceptance">
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-8">1. Introduction &amp; Acceptance</h2>
            <div className="space-y-6 text-on-surface-variant leading-relaxed font-body font-light text-lg">
              <p>Welcome to the AetherAvia Archive. By accessing or using this digital sanctuary, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions. These terms constitute a legally binding agreement between you and AetherAvia Artisanal Heritage.</p>
              <p>Our commitment is to the preservation of ancient skincare rituals. If you do not agree with any part of these terms, we kindly ask that you refrain from accessing our collections.</p>
            </div>
          </section>

          {/* Section 2: Products */}
          <section className="scroll-mt-32" id="products">
            <div className="bg-surface-container-low p-10 md:p-16 relative overflow-hidden rounded-sm border border-outline-variant/10">
              <div className="relative z-10">
                <h2 className="font-headline text-3xl font-bold text-on-surface mb-8">2. Product Descriptions &amp; Artisanal Use</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <p className="font-body text-on-surface-variant leading-relaxed font-light">
                      Our collections—including our <span className="text-primary font-semibold">Body Wash</span>, <span className="text-primary font-semibold">Body Scrub</span>, and <span className="text-primary font-semibold">Face Wash</span>—are crafted in small batches following ancient lunar cycles and seasonal availability.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-4">
                      <span className="px-4 py-1.5 bg-secondary-container/50 text-on-secondary-container text-[10px] font-bold rounded-full uppercase tracking-widest font-label">Multani Mitti</span>
                      <span className="px-4 py-1.5 bg-secondary-container/50 text-on-secondary-container text-[10px] font-bold rounded-full uppercase tracking-widest font-label">Chandan</span>
                      <span className="px-4 py-1.5 bg-secondary-container/50 text-on-secondary-container text-[10px] font-bold rounded-full uppercase tracking-widest font-label">Reetha</span>
                    </div>
                  </div>
                  <div className="space-y-4 font-serif italic text-secondary text-base border-l border-outline-variant/30 pl-8 font-light">
                    <p>"Each batch is a unique manifestation. Variations in color, texture, and scent are not flaws, but signatures of the natural ingredients and handcrafted process."</p>
                  </div>
                </div>
              </div>
              {/* Subtle botanical element */}
              <div className="absolute -right-10 -bottom-10 opacity-5 select-none pointer-events-none">
                <img 
                  alt="Botanical Sketch" 
                  className="w-80 h-80 grayscale" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1UloaoVM6Ff08tpa4PfYEB1poUW8KVC_73D6DOrkCv6TBiJ5gYUGaa-tQo5j2JsZEVB14SPyx4YqRMh-8p6qANmynPx18me3wsITKAKuWaiAkbdwRcDjUzi_iLUmx7yR7PMoij69AmwaA45U7NWZYUkpj1Z2lbipNZgaEuqvrclP5MpoJ2VhWJOGXJT0Nffm45OCuPCKI6m2T_XRwWYEv4iq1PdXJyIVUNwNoA-hFgVyIsAK9SzFZ33gM5PYouqFA451FWN_MikyW"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Ordering */}
          <section className="scroll-mt-32" id="payments">
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-8">3. Ordering &amp; Payments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 font-body text-on-surface-variant text-lg font-light">
              <div className="space-y-4">
                <h4 className="font-bold text-on-surface font-headline uppercase tracking-wide text-sm">Order Formation</h4>
                <p>An order is considered a "request for ritual." We reserve the right to decline any order due to limited artisanal supply or verification requirements. All prices are in the local currency of the Archive.</p>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-on-surface font-headline uppercase tracking-wide text-sm">Secure Alchemy</h4>
                <p>Payment transactions are processed through encrypted channels. We never store your sensitive financial data within the Archive's primary vaults.</p>
              </div>
            </div>
          </section>

          {/* Section 4: Shipping */}
          <section className="scroll-mt-32" id="shipping">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="w-full md:w-1/2">
                <div className="relative aspect-[4/3] rounded-sm overflow-hidden shadow-2xl">
                  <Image 
                    fill
                    alt="Artisanal Packaging" 
                    className="object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnolspoEEPLN9s490I3tqbglK6pGH49jbw9xeYm05ksrZX7LC7WOmbkcHE1yKQ-hsEd5FyLEombY8PtXlcdy8qqXf-YAbDTkq7_2d3oSfPyY18ughjhfhsCyWUewRUGjvJPakUCeuE2Rj5rxwz1ZWZnTgPFSWdSA54iVm-9HwWt91DEgBp-cU09S6ZFHKFAwsMHv8O1Kz1oVObE9EKS6uA7oPpWGaXx8QFDf8Qel8l41WT6z8U5Ii8LSzjcdECwVtMsfIzsMKQvxG8"
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2 space-y-6">
                <h2 className="font-headline text-3xl font-bold text-on-surface">4. Heritage Shipping</h2>
                <p className="font-body text-on-surface-variant text-lg font-light leading-relaxed">
                  We ship our treasures globally, prioritizing couriers who respect the fragile nature of artisanal glass and clay vessels. Shipping times vary by geography, reflecting the journey from our heritage labs to your doorstep.
                </p>
                <p className="font-serif italic text-primary text-xl">Expected transit: 7 to 14 solar days.</p>
              </div>
            </div>
          </section>

          {/* Section 5: Returns */}
          <section className="scroll-mt-32" id="returns">
            <div className="border-t border-outline-variant/20 pt-16">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-8">5. Ritual Cancellation &amp; Returns</h2>
              <div className="space-y-8 font-body font-light text-lg">
                <div className="bg-surface-container-high p-10 flex gap-8 items-start rounded-sm border-l-4 border-primary/40">
                  <span className="material-symbols-outlined text-primary text-4xl">info</span>
                  <p className="text-on-surface-variant italic leading-relaxed">Due to the botanical and hygienic nature of our products, we cannot accept returns of used or opened vessels. Any "Ritual Cancellation" must occur within 24 hours of the order request.</p>
                </div>
                <p className="text-on-surface-variant leading-relaxed">If a vessel arrives damaged during its pilgrimage, please notify the curators within 48 hours with photographic evidence for a replacement or archival credit.</p>
              </div>
            </div>
          </section>

          {/* Section 6: Intellectual Property */}
          <section className="scroll-mt-32" id="intellectual">
            <div className="bg-primary text-on-primary p-12 md:p-20 rounded shadow-2xl flex flex-col items-center text-center">
              <h2 className="font-headline text-4xl font-bold mb-8">6. Ancient Wisdom</h2>
              <p className="font-serif text-xl opacity-90 leading-relaxed mb-10 max-w-2xl font-light italic">
                The recipes, formulations, botanical sketches, and "AetherAvia" branding are protected intellectual property. They represent generations of ancient wisdom digitized for the modern seeker.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase border border-on-primary/30 px-6 py-2.5 rounded-full">Copyright {new Date().getFullYear()}</span>
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase border border-on-primary/30 px-6 py-2.5 rounded-full">All Rights Preserved</span>
              </div>
            </div>
          </section>

          {/* Section 7 & 8: Legal & Contact */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-outline-variant/20 pt-20">
            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface mb-6">7. Limitation of Liability</h2>
              <p className="font-body text-base text-on-surface-variant leading-loose font-light">
                AetherAvia Artisanal Heritage shall not be held liable for any reaction resulting from the use of our products. While we use natural ingredients (Chandan, Multani Mitti), we advise a patch test for all ritual beginners. Our liability is limited to the purchase price of the product.
              </p>
            </div>
            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface mb-6">8. Contact Information</h2>
              <div className="space-y-6 font-body">
                <p className="text-base text-on-surface-variant font-light leading-relaxed">Seek guidance from our master curators regarding any legal or ritual inquiry:</p>
                <div className="space-y-2">
                  <p className="text-primary font-bold text-xl font-headline tracking-wide">curators@AetherAvia.com</p>
                  <p className="text-secondary text-sm font-light italic opacity-80">Heritage Lane, 12th Block, Old Jaipur, RJ, India</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

