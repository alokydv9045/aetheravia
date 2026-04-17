import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Ingredients & Craftsmanship | Aethravia',
  description: 'We believe in the radical transparency of nature. Each element in our archive is selected for its ancient efficacy and sourced with deep respect for the earth.',
};

export default function IngredientsPage() {
  return (
    <main className="relative pt-16 lg:pt-20 bg-surface text-on-surface overflow-x-hidden">
      <div 
        className="fixed inset-0 pointer-events-none z-[9999]"
        style={{
          opacity: 0.03,
          backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuA7bMqLcuwczcGiQag7RUfsl9YYdkUMuZO3OjofvJ3Td32c5ZKy3ZX3sqAgWENKyET8I0cCAc1fZwdfTfqUgM8jCie3Ddi3qhVRrvXo_B0Sc8L4BIj8RX1iqc35ryUWO29rhY9K1JI7uUewxLGqFkXXopBAJJ_03xJEBwLgAAaLmua-rQ7dlMKlKvxOvAtEP1QK5zFpgemu1OKs6mRTFVNvEJKFhwkrqTt5WqpDKYZmHCc1-x4hZ9D4OV7QI2K8_GZ_WweZPdoSN4Yj)'
        }}
      ></div>

      {/* Hero Header */}
      <section className="relative px-8 pt-8 pb-16 md:pt-16 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <span className="inline-block px-4 py-1 mb-6 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold tracking-widest uppercase">The Artisanal Archive</span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-headline tracking-tight text-primary leading-tight mb-8">Ingredients & Craftsmanship</h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-lg leading-relaxed font-body">
              We believe in the radical transparency of nature. Each element in our archive is selected for its ancient efficacy and sourced with deep respect for the earth.
            </p>
          </div>
          <div className="relative">
            <img 
              className="w-full h-[500px] object-cover rounded-lg shadow-2xl grayscale-[20%] sepia-[10%]" 
              alt="Close-up artistic shot of raw sandalwood blocks and clay powder on a textured linen surface with soft cinematic shadows" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNJh12BRNuGlUXpffhs4KbarCQcNgct0j2q6CPdyTIS4bzAArjt-qpAcxxjSmMtW9gDAOsc0YO3VaScHhaiSumdG7SlcfCpdgoocKG_j_oivJIXdiTd_vk4qmpG8QMfYjWFPDdMqn9_ck4SieGx-TZeTSEr_N9esaNUL6MU1237-GTH5RQi1w7EY24X3ExVeuQt68JS_RB6KcS2nZQKnLs9rXRgxV2VMHt-T4vrpakUQXNorMmRklk_gMoQN4oJ_EpNstjolFptWIE"
            />
            <div className="absolute -bottom-8 -left-8 p-6 bg-surface-container-lowest shadow-xl max-w-xs rounded-lg">
              <p className="font-headline italic text-primary">"The quality of a remedy is found in the soil it grew from."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nature's Finest Ingredients */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-headline text-on-surface mb-4">Nature's Finest</h2>
              <p className="text-on-surface-variant max-w-md font-body">Our core botanical pillars, chosen for their timeless healing properties.</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Multani Mitti */}
            <div className="group">
              <div className="mb-6 overflow-hidden rounded-lg">
                <img 
                  className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt="Artisanal bowls of finely ground ochre-colored clay powder with dried botanical leaves scattered around" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJs6gkQ_c3Og5k4PePlN6rzeH1JyPF6kJAOFXwS6kNTEgvOh56FXRgL-NPpqZc4bzy8Fsnra3B-1goyGJpB0kK45lK6uQwDH7v9mUg6MuVz87PTY1IQSnsFTHdImtjLW_BQnRyvI5nQL7sMWSjyRaBJQiQPGe0_AnV7quNJbnydWb2MKO09dbqE-q5E3ogtFM-Q2JAcG89ggMG1zuClw6D82h3StH3m5b8v51n5prG2k74rspKbPTiVieH7s8FsbzIjPVL5YWqaedk"
                />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-body">Purifying</span>
                <span className="text-xs text-outline font-medium tracking-wide font-body">Sourced: Rajasthan</span>
              </div>
              <h3 className="text-2xl font-headline text-primary mb-3">Multani Mitti</h3>
              <p className="text-on-surface-variant text-base leading-relaxed mb-4 font-body">Also known as Fuller's Earth, this deep-cleansing clay draws out impurities while preserving natural moisture.</p>
              <hr className="border-outline-variant/30" />
            </div>
            
            {/* Chandan */}
            <div className="group mt-12 md:mt-24">
              <div className="mb-6 overflow-hidden rounded-lg">
                <img 
                  className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt="Cross-section of high-quality sandalwood logs showcasing the dense heartwood and rich texture" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUdLsqzynGUpEez1ry3TArrBFrSYAK3cJcyI_P3WAOsRS1zoxfLafhG5N4s3p4aTuwd27gEiEXb-3mWYLKXvUvykmEcJk8xN02tCsKjYU4sR0-xqW3xM51Wm2btxiR0PiLAXb-rTIzpB_4p43cmgg6Yh83H11I5SNAez8brpLQoSZB9Q-6DrVHxFBYHRHHr10UYcDbgc7VzjABzqQjduUAKxMrt10FkFRLtO31bZ92UwgIHBiwKIomGsBtIMT_Px30VPFACi_SIj4o"
                />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-body">Soothing</span>
                <span className="text-xs text-outline font-medium tracking-wide font-body">Sourced: Mysore</span>
              </div>
              <h3 className="text-2xl font-headline text-primary mb-3">Chandan</h3>
              <p className="text-on-surface-variant text-base leading-relaxed mb-4 font-body">Sandalwood paste provides a cooling sensation that calms inflammation and reduces pigmentation naturally.</p>
              <hr className="border-outline-variant/30" />
            </div>
            
            {/* Reetha */}
            <div className="group">
              <div className="mb-6 overflow-hidden rounded-lg">
                <img 
                  className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt="Whole soapnuts in a rustic wicker basket with sunlight filtering through, highlighting their leathery skin" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvP2m6P9OyO6WpG62MQ4kOfNb_i7UH0gm9BNmQgNWvAOreLIqjxKKMiEEzhTdpM0G06Izo61lFylb2BLP-ye7PTrd8a2a6sisu86ye7Lt7jNiSvTOvmsbv2D3GY3RJh_qmJH6bTv66fR61j4CgB5pLTFRuqofWUV5hXvItzWcSduhgnqrEDBaLyC_0_5od2EpkdSDejswUEQhO_nwZyLhf-iDLfAKPLvq7DmuZnndOp2rvTiItWf5z_DaxXRRLUcNKX0JUE9zW58uw"
                />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-body">Cleansing</span>
                <span className="text-xs text-outline font-medium tracking-wide font-body">Sourced: Himalayas</span>
              </div>
              <h3 className="text-2xl font-headline text-primary mb-3">Reetha</h3>
              <p className="text-on-surface-variant text-base leading-relaxed mb-4 font-body">Soapnut is nature's own surfactant. Rich in saponins, it creates a gentle lather without stripping natural oils.</p>
              <hr className="border-outline-variant/30" />
            </div>
          </div>
        </div>
      </section>

      {/* What We Don't Use (Bento Grid) */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-headline mb-4 text-on-surface">Purity by Omission</h2>
            <p className="text-on-surface-variant italic font-headline text-lg">What we leave out is as important as what we put in.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-8 bg-surface-container-lowest border border-outline-variant/20 flex flex-col items-center text-center rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-error mb-4 text-4xl">close</span>
              <h4 className="font-headline text-xl text-on-surface mb-2">Parabens</h4>
              <p className="text-sm font-body text-on-surface-variant">Zero chemical preservatives</p>
            </div>
            <div className="p-8 bg-surface-container-lowest border border-outline-variant/20 flex flex-col items-center text-center rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-error mb-4 text-4xl">close</span>
              <h4 className="font-headline text-xl text-on-surface mb-2">Sulfates</h4>
              <p className="text-sm font-body text-on-surface-variant">No harsh foaming agents</p>
            </div>
            <div className="p-8 bg-surface-container-lowest border border-outline-variant/20 flex flex-col items-center text-center rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-error mb-4 text-4xl">close</span>
              <h4 className="font-headline text-xl text-on-surface mb-2">Synthetic Fragrance</h4>
              <p className="text-sm font-body text-on-surface-variant">Only natural essential oils</p>
            </div>
            <div className="p-8 bg-surface-container-lowest border border-outline-variant/20 flex flex-col items-center text-center rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-error mb-4 text-4xl">close</span>
              <h4 className="font-headline text-xl text-on-surface mb-2">Phthalates</h4>
              <p className="text-sm font-body text-on-surface-variant">Free from hormone disruptors</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Craftsmanship Process */}
      <section className="py-24 bg-surface-container-highest">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl font-headline mb-16 text-center text-on-surface">The Path to Purity</h2>
          
          <div className="relative flex flex-col md:flex-row gap-12">
            <div className="flex-1 relative bg-surface-container-low p-8 rounded-lg shadow-sm mt-8 md:mt-0">
              <div className="text-6xl font-headline text-outline-variant/30 absolute -top-8 -left-4 font-bold">01</div>
              <span className="material-symbols-outlined text-primary mb-4 text-4xl">eco</span>
              <h3 className="text-2xl font-headline mb-3 text-on-surface">Sourcing</h3>
              <p className="text-base text-on-surface-variant leading-relaxed font-body">Direct relationships with organic farmers across the Indian subcontinent ensures the highest grade of raw materials.</p>
            </div>
            <div className="flex-1 relative bg-surface-container-low p-8 rounded-lg shadow-sm mt-8 md:mt-0">
              <div className="text-6xl font-headline text-outline-variant/30 absolute -top-8 -left-4 font-bold">02</div>
              <span className="material-symbols-outlined text-primary mb-4 text-4xl">science</span>
              <h3 className="text-2xl font-headline mb-3 text-on-surface">Formulation</h3>
              <p className="text-base text-on-surface-variant leading-relaxed font-body">Bridging Ayurvedic wisdom with modern chemistry to create stable, effective, and sensory-rich skin treatments.</p>
            </div>
            <div className="flex-1 relative bg-surface-container-low p-8 rounded-lg shadow-sm mt-8 md:mt-0">
              <div className="text-6xl font-headline text-outline-variant/30 absolute -top-8 -left-4 font-bold">03</div>
              <span className="material-symbols-outlined text-primary mb-4 text-4xl">verified</span>
              <h3 className="text-2xl font-headline mb-3 text-on-surface">Testing</h3>
              <p className="text-base text-on-surface-variant leading-relaxed font-body">Each batch undergoes dermatological scrutiny and small-batch efficacy testing before ever reaching the jar.</p>
            </div>
            <div className="flex-1 relative bg-surface-container-low p-8 rounded-lg shadow-sm mt-8 md:mt-0">
              <div className="text-6xl font-headline text-outline-variant/30 absolute -top-8 -left-4 font-bold">04</div>
              <span className="material-symbols-outlined text-primary mb-4 text-4xl">inventory_2</span>
              <h3 className="text-2xl font-headline mb-3 text-on-surface">Packaging</h3>
              <p className="text-base text-on-surface-variant leading-relaxed font-body">Hand-packed in sustainable glass and recycled cardstock to minimize our environmental footprint.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Certifications */}
      <section className="py-24 px-8 border-y border-outline-variant/20 bg-surface">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-12 md:gap-24 items-center opacity-80 text-on-surface">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-5xl">workspace_premium</span>
            <span className="text-[10px] font-bold font-body uppercase tracking-widest text-on-surface-variant">Certified Organic</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-5xl">pets</span>
            <span className="text-[10px] font-bold font-body uppercase tracking-widest text-on-surface-variant">Cruelty Free</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-5xl">health_and_safety</span>
            <span className="text-[10px] font-bold font-body uppercase tracking-widest text-on-surface-variant">Dermo Tested</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-5xl">recycling</span>
            <span className="text-[10px] font-bold font-body uppercase tracking-widest text-on-surface-variant">Recyclable</span>
          </div>
        </div>
      </section>

      {/* Quality Assurance Promise */}
      <section className="py-24 px-8 bg-surface">
        <div className="max-w-4xl mx-auto bg-primary text-on-primary p-12 md:p-24 rounded-2xl relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[10rem]">approval</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-headline mb-12 relative z-10">Quality Assurance Promise</h2>
          
          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            <ul className="space-y-6">
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-secondary-fixed mt-1">done</span>
                <span className="font-body text-base leading-relaxed opacity-90">Small-batch production to ensure every jar meets our exacting standards.</span>
              </li>
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-secondary-fixed mt-1">done</span>
                <span className="font-body text-base leading-relaxed opacity-90">Climate-controlled manufacturing to preserve the bio-activity of botanicals.</span>
              </li>
            </ul>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-secondary-fixed mt-1">done</span>
                <span className="font-body text-base leading-relaxed opacity-90">Full traceability of every single ingredient from seed to skin.</span>
              </li>
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-secondary-fixed mt-1">done</span>
                <span className="font-body text-base leading-relaxed opacity-90">Zero-waste facility mandates across our entire formulation chain.</span>
              </li>
            </ul>
          </div>
          
          <button className="relative z-10 mt-12 px-10 py-5 bg-on-primary text-primary font-bold font-label uppercase tracking-widest text-xs rounded shadow-lg hover:bg-surface transition-all active:scale-95 border-none cursor-pointer">
            Read Our Ethics Manifesto
          </button>
        </div>
      </section>

    </main>
  );
}