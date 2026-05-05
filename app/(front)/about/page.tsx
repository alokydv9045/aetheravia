import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Our Story | AetherAvia',
  description: 'A dialogue between ancestral memory and modern science. Learn about the genesis of AetherAvia.',
};

export default function AboutPage() {
  return (
    <main className="relative pt-16 overflow-x-hidden bg-surface text-on-surface">
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBs4LRkuZ_fgnZA5hlF5xmln5wZhl-f2UNDmy_eT_QRjQvmmhxapg_F7nZjGZHVYULdfvLGdEcX375td5zla1K2E59t3glVSRSaSomsXpHFqPtsK8Q31UBD3b2A67ruxK1llebrGaibNkCfTvW2cAq2Avkj0IZXQzVce3sVHPllgP-mqABjGfaZoRj3iJgvwV4WKekdV1dWRYqkCIbFYml4iRYkC9ZYzcOfNoutS1GBUT3IrFEB3jq-0ZsxVINkx7NUC1ThEFhiwVi-)',
          opacity: 0.03
        }}
      ></div>

      {/* 1. Hero Section */}
      <section className="px-8 md:px-24 pt-0 pb-20 lg:pb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative z-10 max-w-xl">
          <h1 className="font-headline text-5xl md:text-6xl lg:text-7xl text-primary leading-tight -tracking-[0.03em]">
            Our Story
          </h1>
          <p className="mt-6 font-headline text-xl md:text-2xl text-secondary leading-relaxed italic">
            A dialogue between ancestral memory and modern science.
          </p>
          <div className="mt-10 h-px w-24 bg-primary/30"></div>
        </div>
        
        <div className="relative grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden translate-y-8 shadow-sm">
              <img 
                className="w-full h-full object-cover" 
                alt="Close up of raw blocks of Multani Mitti clay with organic textures on a neutral stone background" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8YBHIo6CQzqQt_KJAxL29Yk3q-E1yfbcO04zDH-T1vJpbPPFxmqbdqiyArK1O_0Ozf1ePi9ltyN39qjRP1WcQySUMRWycv7qSfyJ_cIpo5oXJOUeUaqMdjq8B810oSOuUL5yEg54FJijv-n3BAc9RSn-wYmlndGhBlY7vj4OJf611-DuUITkC7qsnrNAUYc0zyWiAx3mllYILIjX6wzC04S_sLmCNbFtyGef30VS_c3dfukDOVSbcZJAm7jUSZXSgcO2gMwro4QjH"
              />
              <div className="absolute bottom-4 left-4 text-on-primary bg-primary/20 backdrop-blur-sm px-3 py-1 text-xs uppercase tracking-widest rounded-sm">
                Multani Mitti
              </div>
            </div>
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-sm">
              <img 
                className="w-full h-full object-cover" 
                alt="Sun-dried Reetha soapnuts in a rustic wooden bowl with soft natural window light" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8eWB785McbCCijXIJ998jpQ6a0YL7qFxZZOaF1S0FfVtYSiflkDE8fgpTq8KVwPbDLEDhy2F4hLJHDpEDsS8rih3B7hM0uumijYULGHkHsSXY6NqV6DeniJ2Dalg5aPNG3iF3lkPgEdOtoP9jUtp5ryCTk6h19fhS9kZpOEjzYp_8PcsXJvVIGlezWS90ah7nWxssCA6OfRA30MQD-Kda1yaQCIyx2IqbdI1RDUA7Bbo6xKahVC8qUK68KDTUWquZ9EGmHGndq0uF"
              />
              <div className="absolute bottom-4 left-4 text-on-primary bg-primary/20 backdrop-blur-sm px-3 py-1 text-xs uppercase tracking-widest rounded-sm">
                Reetha
              </div>
            </div>
          </div>
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden mt-20 shadow-sm">
            <img 
              className="w-full h-full object-cover" 
              alt="Artisanal sandalwood sticks stacked neatly with fine powder on a clay surface" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKgxp3LqLzuVfyry3P3i6RnASnmIGUjpjw__UxcnGM00lTCvRTX31LUcMoYWlYpUrg1MyTMiGtKTgQDbAGIgyX_9fHq0rkekTrYEN_bt0WiQRaOKpzncEHzFI32nu5_t1VzlNXewiU3Dvkiolqba1tE17Xk0xouNmulhb04S-xwJASKQnY0Qzt216tuQdYa5tmJCmVF53oYLwOeLzPv5CFZ2IpOuxXZWqCzYbUMBKHxXueTiGmIW2c4JZEy9AL0NhMg2F07r3TCtsN"
            />
            <div className="absolute bottom-4 left-4 text-on-primary bg-primary/20 backdrop-blur-sm px-3 py-1 text-xs uppercase tracking-widest rounded-sm">
              Chandan
            </div>
          </div>
        </div>
      </section>

      {/* 2. How AetherAvia Began */}
      <section className="bg-surface-container-low px-8 md:px-24 py-32">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 items-center">
          <div className="w-full md:w-1/2 relative group">
            <div className="absolute -top-6 -left-6 w-full h-full bg-surface-container-highest -z-10 rounded-lg"></div>
            <img 
              className="w-full aspect-[4/5] object-cover rounded shadow-2xl transition-transform duration-500 group-hover:-translate-y-2" 
              alt="A weathered traditional mortar and pestle being used to grind botanical herbs, high-end editorial photography" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFfLmBkzA6y3ExVnvxkyFC6s_cs8n_sy-gyM-njsJD5Mnik5EijWvXlvwRPSASAlbuibtk_kAmhHkuiCImMnfaEF8qdLTBYz-Qt5PbPGu0J2L_7rUrIaYjI2Im06xB7QpMNUMpOjd3i7GosEfcbX26QqpaSMjp8Cuwpd6vW4uwigLZT0_w8lWALKPCtjA2PANKwS22fIFzXSTZJ_pvWvLAgmvJcXiyKCvyV7zdUgs-iZQITYxJcaK9VsyOYmdQHyr9te2NJF8-usuf"
            />
          </div>
          <div className="w-full md:w-1/2">
            <span className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-4 block">The Genesis</span>
            <h2 className="font-headline text-3xl md:text-4xl text-on-surface mb-6 leading-tight">How AetherAvia Began</h2>
            <div className="space-y-5 text-on-surface-variant leading-loose text-base md:text-lg font-light font-body">
              <p>
                It started not in a lab, but in the memory of a grandmother’s courtyard. Arpita Kashyap watched as the raw materials of the earth—clays, oils, and barks—were transformed into potent elixirs that outperformed anything on a modern shelf.
              </p>
              <p>
                AetherAvia was born from a singular question: why must we choose between the soul of tradition and the precision of modern clinical science? We set out to bridge this gap, ensuring that every drop of our formulations honors the heritage it claims while meeting the rigorous standards of modern dermatology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Mission */}
      <section className="px-8 py-40 text-center bg-surface relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-block px-4 py-1 mb-8 border border-primary/20 rounded-full text-[10px] uppercase tracking-[0.3em] text-primary">
            Manifesto
          </div>
          <h2 className="font-headline text-4xl md:text-5xl text-primary leading-tight mb-8">
            Revolutionizing body care by proving that earth's wisdom is the ultimate laboratory.
          </h2>
          <p className="font-body text-lg md:text-xl text-secondary max-w-3xl mx-auto leading-relaxed tracking-wide">
            Our mission is to elevate the ritual of self-care into a sacred dialogue with nature, guided by transparency, ethics, and unparalleled performance.
          </p>
        </div>
        {/* Decorative botanical ghost image */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-5 pointer-events-none">
          <img 
            className="w-96 grayscale" 
            alt="Delicate dried botanical leaf veins against a pale background" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1tUFa_1ND1gU0MplZU634sdsqya53-cvEH8Ov5IVlHYMZ8aKkc-S5WLDJkTH5LnL5THzXoNNvGvsU2kVAWdWkSyslYzjHKlIV0vXcTuiHK5jOa45UqYoWX7VvIyG_mPbgWnP7yiYGcz5ofio2cahLmECpLtLjcpErYuxO8EYadA7SZouaOYvRio8lCC7HaBmieq_D6QrCl-PpkRR4ZCY99aJ6cRo7_rE54YyrwXUHNNH8p1Fg0oXY-lTiKwimgRI7ea7qpjP1Udqu"
          />
        </div>
      </section>

      {/* 4. What Makes Us Unique (Bento-style Grid) */}
      <section className="px-8 md:px-24 py-24 md:py-32 bg-surface-container-highest">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="font-headline text-3xl md:text-4xl text-on-surface mb-4">The AetherAvia Standard</h2>
            <p className="font-body text-secondary tracking-widest uppercase text-xs">Six pillars of artisanal excellence</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-outline-variant/10">
            {/* Card 1 */}
            <div className="bg-surface-container-low p-12 transition-all hover:bg-surface-container-lowest">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">science</span>
              <h3 className="font-headline text-2xl text-on-surface mb-4">Science-Driven</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">Formulations stabilized by modern molecular chemistry to ensure every active stays potent.</p>
            </div>
            {/* Card 2 */}
            <div className="bg-surface-container-low p-12 transition-all hover:bg-surface-container-lowest">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">spa</span>
              <h3 className="font-headline text-2xl text-on-surface mb-4">Active-Rich</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">We don't use "fairy dusting." Our botanical extracts are used at clinically effective concentrations.</p>
            </div>
            {/* Card 3 */}
            <div className="bg-surface-container-low p-12 transition-all hover:bg-surface-container-lowest">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">verified_user</span>
              <h3 className="font-headline text-2xl text-on-surface mb-4">Derm-Tested</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">Hypoallergenic and rigorously tested on all skin types under dermatological supervision.</p>
            </div>
            {/* Card 4 */}
            <div className="bg-surface-container-low p-12 transition-all hover:bg-surface-container-lowest">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">cruelty_free</span>
              <h3 className="font-headline text-2xl text-on-surface mb-4">Cruelty-Free</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">Compassion is our core ingredient. No animal testing, ever, at any stage of our process.</p>
            </div>
            {/* Card 5 */}
            <div className="bg-surface-container-low p-12 transition-all hover:bg-surface-container-lowest">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">visibility</span>
              <h3 className="font-headline text-2xl text-on-surface mb-4">Visible Results</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">Skin transformation you can see and feel within the first 14 days of ritual use.</p>
            </div>
            {/* Card 6 */}
            <div className="bg-surface-container-low p-12 transition-all hover:bg-surface-container-lowest">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">potted_plant</span>
              <h3 className="font-headline text-2xl text-on-surface mb-4">Ethically Crafted</h3>
              <p className="font-body text-on-surface-variant leading-relaxed">Small-batch production ensuring fair wages for our harvesters and minimal waste.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Founders' Messages Section */}
      <section className="px-8 md:px-24 py-24 md:py-32 space-y-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-4 block">Our Leadership</span>
            <h2 className="font-headline text-3xl md:text-4xl text-on-surface">The Minds Behind the Ritual</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-24">
            {/* Founder: Arpita Kashyap */}
            <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="lg:w-1/3 relative">
                <div className="aspect-[3/4] overflow-hidden rounded-lg">
                  <img 
                    className="w-full h-full object-cover grayscale brightness-90 contrast-110" 
                    alt="Professional and serene portrait of Arpita Kashyap, founder of AetherAvia, in a modern artisanal studio" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDA256z3YpgCPE4vHYl-mI5eA55gL5MuODVlIFm43YcYcmtxEMToMFouCu0w0cyoGSYCgcFpAqK73T8u1q0yTl3ANhEL-H6ZadWVIcZtQlJMrZF6dgS7uhahLsMMdmwfXyO4QVo-0hsbIdvPB9E0aC5nsWWzkr4lI6H8Q_0X0XHaCYs2AOrlsyHBJlIOTw96KOGHjmbxDXFiVZ3sgV0QSg-CWiqcVZ-4pS7DhC66C4CdzWxfD2aShZbnHPPbRChEPLl3tFQQ6ZqAiwI"
                  />
                </div>
                <div className="absolute -bottom-8 -right-8 bg-primary text-on-primary p-8 rounded-lg shadow-xl hidden sm:block">
                  <p className="font-headline text-lg italic">"Nature does not hurry, yet everything is accomplished."</p>
                </div>
              </div>
              <div className="lg:w-2/3 max-w-2xl">
                <h4 className="font-headline text-2xl md:text-3xl text-on-surface mb-6">A Message from Our Founder</h4>
                <blockquote className="text-xl md:text-2xl font-headline text-secondary leading-relaxed mb-8 italic">
                  "AetherAvia isn't just about skincare; it's about reclaiming the moments of quietude we've lost to a fast-paced world. We invite you to slow down, feel the texture of the earth on your skin, and remember who you are."
                </blockquote>
                <div>
                  <p className="font-bold font-body text-on-surface tracking-widest uppercase">Arpita Kashyap</p>
                  <p className="font-body text-on-surface-variant text-sm mt-1">Founder & Chief Formulation Officer</p>
                </div>
              </div>
            </div>
            
            {/* Co-Founder: Vikram Rathore */}
            <div className="flex flex-col lg:flex-row-reverse gap-20 items-center">
              <div className="lg:w-1/3 relative">
                <div className="aspect-[3/4] overflow-hidden rounded-lg">
                  <img 
                    className="w-full h-full object-cover grayscale brightness-90 contrast-110" 
                    alt="Professional studio portrait of Vikram Rathore, co-founder of AetherAvia, in a neutral earthy linen shirt with a warm, confident expression." 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9tw_ZtPUCzn7MonlKY_B4WdwHml_HBvdfW9RDq7BXMxNOFL0hhvSjNZVBSGioh-4ONANd5IIxJVJ7gwDK0goZ8YMBga292pupawMFbVWnj7MT08q95x0A73bWboc4jk8XlG7kPSnCm7golwmU9TCt8jwINuLL-e43M6PJu60uJnLBltoWM2IPCPwfi2J8vF0mXEQnU5MoaTh1IRsVG3cIMmrF4MWJmwDizPykKGAkMKfrDN5jSVY68prq_6S_oUMqX8f-_H_FFwuI"
                  />
                </div>
                <div className="absolute -bottom-8 -left-8 bg-secondary text-on-primary p-8 rounded-lg shadow-xl hidden sm:block">
                  <p className="font-headline text-lg italic">"Precision is the highest form of respect for tradition."</p>
                </div>
              </div>
              <div className="lg:w-2/3 max-w-2xl lg:text-right">
                <h4 className="font-headline text-2xl md:text-3xl text-on-surface mb-6">A Note from Our Co-Founder</h4>
                <blockquote className="text-xl md:text-2xl font-headline text-secondary leading-relaxed mb-8 italic">
                  "Our goal was never to replicate the past, but to refine it. By applying the rigor of modern science to heritage ingredients, we ensure that the wisdom of the ancients meets the expectations of the future."
                </blockquote>
                <div className="lg:flex lg:flex-col lg:items-end">
                  <p className="font-bold font-body text-on-surface tracking-widest uppercase">Vikram Rathore</p>
                  <p className="font-body text-on-surface-variant text-sm mt-1">Co-Founder & Head of Innovation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Our Commitments */}
      <section className="bg-surface-container-high py-24 md:py-32 px-8 text-center">
        <div className="max-w-3xl mx-auto border-y border-outline-variant/30 py-16">
          <h2 className="font-headline text-3xl md:text-4xl text-primary mb-6">Our Everlasting Commitment</h2>
          <p className="font-body text-on-surface-variant text-base md:text-lg leading-loose mb-10">
            We pledge to remain transparent about our supply chain, to never compromise on ingredient purity, and to continuously innovate toward a more regenerative future for our planet and your skin.
          </p>
          <a className="inline-flex items-center gap-3 bg-primary text-on-primary px-10 py-5 rounded-lg font-bold font-label tracking-widest uppercase text-xs transition-all hover:bg-primary/90" href="/ritual">
            Explore the Rituals
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
      </section>
    </main>
  );
}