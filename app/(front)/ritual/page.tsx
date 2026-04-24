import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rituals | Aethravia Artisanal Heritage',
  description: 'Explore the artisanal heritage and our ritual guides.',
};

export default function RitualPage() {
  return (
    <div className="bg-background text-on-surface font-body selection:bg-secondary-container relative w-full overflow-x-hidden">
      {/* SideNavBar (Contextual for Ritual Selection) */}
      <div className="pt-8 md:pt-12 w-full max-w-[1400px] mx-auto min-h-screen">
        <div className="noise-overlay fixed inset-0"></div>

        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center px-6 md:px-16 overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-12 items-center w-full">
            <div className="lg:col-span-6 z-10 space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-bold font-label tracking-[0.3em] uppercase text-primary opacity-60">Handcrafted Wisdom</span>
                <h1 className="text-5xl md:text-6xl lg:text-8xl font-headline text-on-surface leading-[1.1] tracking-tighter">
                  The Art of <br /><span className="italic text-primary font-light">the Ritual</span>
                </h1>
              </div>
              <p className="text-lg text-secondary max-w-lg leading-relaxed font-body font-light">
                In the silence of the morning or the twilight of the evening, skincare becomes a bridge to heritage. We invite you to slow down, feel the textures of the earth, and reconnect with the artisanal wisdom of the ages.
              </p>
              <div className="flex gap-6 pt-4">
                <Link 
                  href="#preparation"
                  className="bg-primary text-on-primary px-10 py-4 font-label uppercase tracking-widest text-xs font-bold rounded-sm hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 text-center"
                >
                  Explore Ceremonies
                </Link>
                <Link 
                  href="/about"
                  className="border border-outline-variant/30 text-on-surface px-10 py-4 font-label uppercase tracking-widest text-xs font-bold rounded-sm hover:bg-surface-container-low transition-all duration-300 text-center"
                >
                  Our Story
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6 relative">
              <div className="relative w-full aspect-[4/5] bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-outline-variant/10">
                <img alt="Ritual setup" className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000" data-alt="close-up of raw earth clay and wooden bowls on a textured linen cloth in soft cinematic lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-mSKXtChkyDjXXLkTIv0-qf-jND_84nNbq05GdDNjaIdSkdpv-WV_rzhA550Qp3N7SYEOkKF7oxhdrVIrGsJRObapg6ul9VxdptNOlA-KRPnwXNocIO-nC7eqNlF47P5aBRJy8o9FRdbb_iWy3G_gjbkYO2nzcaNOHC8JR7QRzJn5Ilg3lkN6CJB5G1geJUdZUNMRwYMDuyhY-59atHpuCTDyA0SppJPb0CM2oW1xXKEzkfgR_X5bpDbqvLA-OY3vBU6EqorHCaD3" />
              </div>
              <div className="absolute -bottom-8 -left-8 md:-left-12 p-10 bg-surface-container-lowest/90 backdrop-blur-xl shadow-2xl rounded-sm max-w-xs border border-outline-variant/20 z-20">
                <span className="font-headline italic text-primary text-xl block mb-3 leading-none">The Earth Speaks</span>
                <p className="text-sm text-secondary leading-relaxed font-body font-normal opacity-80">"Every smear of clay is a dialogue between the soil and your soul."</p>
              </div>
            </div>
          </div>
        </section>

        {/* Preparation Section */}
        <section id="preparation" className="py-32 px-6 md:px-16 bg-surface-container-lowest/50 backdrop-blur-sm mt-16 rounded-3xl border border-outline-variant/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-baseline mb-24 gap-12">
              <div className="max-w-2xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-6 block font-label opacity-60">Stage One</span>
                <h2 className="text-4xl md:text-6xl font-headline tracking-tight leading-tight">Preparation: <br/>The Sensory Altar</h2>
              </div>
              <p className="text-xl text-secondary max-w-md italic font-light leading-relaxed">Gather your elements with intention. The weight of the bowl, the temperature of the water, and the scent of the wood are as vital as the ingredients themselves.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-16">
              <div className="flex flex-col gap-8 group">
                <div className="aspect-[4/5] bg-surface-container rounded-2xl overflow-hidden shadow-lg border border-outline-variant/10">
                  <img alt="Brass bowl" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" data-alt="ancient hand-crafted brass mixing bowl on a dark textured stone background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATexIdksonwhogQUZmLLaNwoiJWqTCd7laB9bTaVBksXb-6twX9SSMXO89NyPvr6eOg7eXa8_4X9ZVH_wjapZ5mQhFo6GqZutv4lNQFnRr47G4K2-1qrl3mnem5iTr1WZunwusuupDI1urhf_XbHAl_Nh84Ose103uk6NqgBfkB-UQczvkqG5GuqyVeqJvphQPQxGxo8ylSNZpgM1OsHKQu3Qlu7s93SnOm7E1DrzbT55T5bNcFc4YuYDWXBmbtRbvO5nIWy8-TBX3" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-headline text-on-surface">The Vessel</h3>
                  <p className="text-base text-secondary/80 leading-relaxed font-body font-light">Choose a brass or ceramic bowl. These materials maintain the coolness of the paste and honor the mineral properties of the clays.</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-8 group">
                <div className="aspect-[4/5] bg-surface-container rounded-2xl overflow-hidden shadow-lg border border-outline-variant/10">
                  <img alt="Botanical water" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" data-alt="crystal clear water rippling in a sunlit ceramic bowl with rose petals floating on surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCH8AX3rmkoojzeqfztDH33C-ozpMi8xQjEKjhtji4ruOcVsb0954dA2GzcdzSrw46FoznwjkYQZxwfDzwf4QR1UHwHCiW3tS109MOYGYhhgZgDkr23CBEtCAO5qH3esVdkE_Sr1MFgvW1Y-RaTZcYnD7z6zMWMKqNGH6g1l9KSDOISKVP8SBRSwIxD6y2Ul4BZTUJW_rvvdWaeuEQeB3ITG9URJYJq98lm5qkGV0X67XJ49vsGDAc1_E7N2Ty90IEzjdHaU_DvllbV" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-headline text-on-surface">Vital Waters</h3>
                  <p className="text-base text-secondary/80 leading-relaxed font-body font-light">Use rain-captured water, steam-distilled rose hydrosol, or pure spring water at room temperature to activate the botanical enzymes.</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-8 group">
                <div className="aspect-[4/5] bg-surface-container rounded-2xl overflow-hidden shadow-lg border border-outline-variant/10">
                  <img alt="Sandalwood brush" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" data-alt="soft bristle facial brush with a carved dark wood handle resting on a linen towel" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmNMHZDJZ5OCtIpGZusAWqOaFGek0ecsxeONfF4Ws_m_2hiNcBPHnIjqBwHhLNXYIRTSgB-XVx9nyJLg3A1OyuqxQdewr9TrlJ2MTVlERiTy20B18xD1do7EAwq3atIiAQzO4q42wMA05fD8Vk47ZWxxyXqUOTypySko1DVGxArFYfSRE06ecMUo-W8xpXJa8q2FJn4RAyLwu_So-beQ80s3IGUxMYRMDxY9GDNvuZ3UY_UOrW8UBld1mLE8QLIE-CzpsIs_Vz0FZh" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-headline text-on-surface">The Applicator</h3>
                  <p className="text-base text-secondary/80 leading-relaxed font-body font-light">A soft-bristle brush or the warmth of your own fingertips. The tactile connection is the final bridge in the ritual's circuit.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ritual Guides */}
        <section className="py-32 px-6 md:px-16" id="cleansing">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-24 items-center mb-40">
              <div className="relative order-2 lg:order-1">
                <div className="relative z-10 w-[85%] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-surface-container-lowest">
                  <img alt="Multani Mitti" className="w-full h-full object-cover" data-alt="raw chunks of golden fuller's earth clay artfully stacked on a textured paper background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1pXEn9nA3c0tlmJKnsDcyqC2OF7Qm1vhBHsRUjW06ULFD_CBEd6xyNDTcPR4icxmkscRb7_hbwwDB8MoiFQr78lKD8lxefsT50h4bVvi2NYFLZYN0apfdeeyhCbNIEpxL4Sk6gPKof8b4iP2FfZRITFOPE4Nd1MFcVDInAdrZdXs3WaDz4PQ5oSCxKNZwuBym0DzqEvIzHFAAKYAaKSl4gyniwQXMSqz87mYYwhmVxJDRuyqO9sVhLDEWKBesslKCJzQQYIOdTRVB" />
                </div>
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-[70%] aspect-square bg-secondary-container rounded-full overflow-hidden -z-0 blur-3xl opacity-30"></div>
              </div>
              <div className="order-1 lg:order-2 space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest border border-primary/20 font-label">Earth Element</span>
                    <span className="text-xs text-secondary/60 font-bold font-label tracking-widest">15 MINS</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-headline leading-[1.1]">The Deep Cleansing Ritual <br /><span className="italic text-primary-container font-light">(Multani Mitti)</span></h2>
                  <p className="text-xl text-secondary leading-relaxed font-light">Multani Mitti, the 'Mud from Multan', is a volcanic clay that has cooled the skin for centuries. It breathes life back into pores, drawing out impurities with the gentle magnetic pull of the earth.</p>
                </div>
                <ul className="space-y-12">
                  <li className="flex gap-8 group">
                    <span className="font-headline text-5xl text-primary/10 group-hover:text-primary/30 transition-colors duration-500">01</span>
                    <div>
                      <h4 className="font-bold text-on-surface text-lg mb-2 font-headline uppercase tracking-wide">Hydrate the Ore</h4>
                      <p className="text-secondary/80 leading-relaxed font-light">Mix two parts <b>cool clay</b> with one part rose water until it reaches the consistency of rich cream. Let it rest for 2 minutes.</p>
                    </div>
                  </li>
                  <li className="flex gap-8 group">
                    <span className="font-headline text-5xl text-primary/10 group-hover:text-primary/30 transition-colors duration-500">02</span>
                    <div>
                      <h4 className="font-bold text-on-surface text-lg mb-2 font-headline uppercase tracking-wide">The Cooling Mask</h4>
                      <p className="text-secondary/80 leading-relaxed font-light">Apply upward and outward. Feel the temperature drop as the clay makes contact with the heat of your skin.</p>
                    </div>
                  </li>
                  <li className="flex gap-8 group">
                    <span className="font-headline text-5xl text-primary/10 group-hover:text-primary/30 transition-colors duration-500">03</span>
                    <div>
                      <h4 className="font-bold text-on-surface text-lg mb-2 font-headline uppercase tracking-wide">The Earth Release</h4>
                      <p className="text-secondary/80 leading-relaxed font-light">Rinse just before the mask is fully dry. As the water meets the clay, inhale the petrichor — the scent of rain on dry soil.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-24 items-center mb-40" id="exfoliating">
              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest border border-primary/20 font-label">Forest Element</span>
                    <span className="text-xs text-secondary/60 font-bold font-label tracking-widest">10 MINS</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-headline leading-[1.1]">The Soothing Glow Ritual <br /><span className="italic text-primary-container font-light">(Chandan)</span></h2>
                  <p className="text-xl text-secondary leading-relaxed font-light">Sandalwood is the soul of the Indian forest. This <b>fragrant golden paste</b> is not just an exfoliant; it is a spiritual veil that calms inflammation and brings a luminous serenity to the complexion.</p>
                </div>
                
                <div className="bg-surface-container-low/50 backdrop-blur-md p-10 rounded-2xl mb-8 relative border border-outline-variant/10">
                  <div className="flex gap-4 items-center mb-6">
                    <span className="material-symbols-outlined text-primary text-3xl" data-icon="auto_fix_high">auto_fix_high</span>
                    <h4 className="font-bold font-label uppercase tracking-widest text-xs opacity-60">Artisan Tip</h4>
                  </div>
                  <p className="text-lg text-secondary italic font-light leading-relaxed">"For deeper restoration, mix Chandan with full-fat milk during the new moon. The lactic acid and sandalwood work in harmony to reset skin cycles."</p>
                </div>
                
                <button className="flex items-center gap-4 text-primary font-bold hover:gap-8 transition-all duration-500 font-label uppercase tracking-[0.2em] text-[10px]">
                  View Heritage Method <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
                </button>
              </div>
              <div className="relative">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="rounded-2xl overflow-hidden aspect-[4/5] shadow-xl border border-outline-variant/10">
                      <img alt="Sandalwood logs" className="w-full h-full object-cover grayscale-[20%]" data-alt="raw sandalwood logs and aromatic shavings on a wooden platter" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgKgKhQ2YgDnLPZL751kf4FjOJX5YfrdDA9kPMl7e4-wGnYVd5ZfFpwOdHiyO_EEGNLXxIdLljTfI2yBgwR_XMq2e3h_EZrC9QHe-px1Kfcl_mHYj47RE3xCSevjfrYK696MmfJnT5pOfnTWjRsexkEaSJtAo6USzr4JDbIuHR7g9Lqu7fiGShlUez2XPo4iTqe6N9zERN0gbSW0wy17rAcefj0aOa9av9ZJRilSc8W8UPVCDsQQ-zjz5OeODH7C8gAKe5fMEKX9g-" />
                    </div>
                    <div className="rounded-2xl overflow-hidden aspect-square shadow-xl border border-outline-variant/10">
                      <img alt="Paste texture" className="w-full h-full object-cover" data-alt="smooth yellow-gold sandalwood paste inside a traditional stone grinder" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9ZShktg9GUcLb2eOrOkddW2dKHaW5df84_hyMJ4_iny76Jlo3g0RSniildI26aAFYp4OyhBtLV4RlsV_27bPKmqKhJ2yWQFjECK6Qppsx1oxLg8OTOD1LRjdESdlmhIm_6aPeOIds-UWLg_939XrfV8bg9-tiJU-7ytbxU-m1lVGMrj5peX1BCIRVF862alVtWm1rUjzOkTpF3A3Avh-LDMDhIfDj7YxEXy54zIbYa3ijIk2zNpD36dpXtuxAQcZa62GQY6_lSGWJ" />
                    </div>
                  </div>
                  <div className="pt-16">
                    <div className="rounded-2xl overflow-hidden aspect-[2/3] shadow-2xl border border-outline-variant/10">
                      <img alt="Serum bottle" className="w-full h-full object-cover" data-alt="elegant amber glass bottle with a minimalist label on a sun-drenched stone shelf" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3drkASHssGCEQc8_6o3DspeVu5qNtBAEvQIB66tt0C72xbWAgdgtmq8BPpLi-orJeOxCnSyogPevxiAq7eU3Vbcgmk-b_Ep9OmzcgZ90aVf1QmYaSDgeEDOFfbewv0hfyaP-uEZTJF_PTt3Gq6G0DpqD7OO9ytrwLlCvW5IDG2LnVX-4DZqseba2KhAX-qeGfTOYDd6snU8XdRNyqo4n1mJXzFmjzMCfhSR7i8ptb9bsFFn4ALv5gv42c0TIWnpdg5s2dQ5CVaUWr" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-24 items-center" id="hydrating">
              <div className="order-2 lg:order-1 relative">
                <div className="w-full aspect-video bg-surface-container rounded-2xl overflow-hidden group shadow-2xl border border-outline-variant/10">
                  <img alt="Reetha lather" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[10%]" data-alt="delicate botanical soap bubbles reflecting light on a dark leaf surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhPBEXj1G62rDU0iDGJDSjpIb0NiNkklq4GEpJoEHx_UzKUrzipedCBalLdbz0JYquLRrDpwgUC7G63jV_tpxr7GWk_uOLqnSH0L_ldJcqfLF0NsPMEnpHjmuasHcOJ_-GBPychyFziPFqaPL59eEVjpmcUYq5njW-3f6P42W6Qyt8AEGpNWNMEb1rKmYn2ilJ5xqCRiHdOS3N4g6LY03oe2876d043IktkMYEJsvIhmBdoqcHHbP_TFDxUG-2d_VqwJE-XNyw4noz" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
                    <span className="text-white font-headline text-3xl italic font-light tracking-tight">The Botanical <br/>Lather</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-8">
                <div className="flex items-center gap-4">
                  <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest border border-primary/20 font-label">Air Element</span>
                  <span className="text-xs text-secondary/60 font-bold font-label tracking-widest">5 MINS</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-headline leading-[1.1]">The Pure Foam Ritual <br /><span className="italic text-primary-container font-light">(Reetha)</span></h2>
                <p className="text-xl text-secondary leading-relaxed font-light">Reetha, or Indian Soapnut, provides a surfactant-free cleanse. Its <b>botanical lather</b> is lightweight yet powerful, lifting the day's stress without disturbing the skin's sacred moisture barrier.</p>
                <div className="space-y-4">
                  <div className="p-8 bg-surface-container-low rounded-2xl border-l-[6px] border-primary shadow-sm">
                    <p className="text-on-surface italic text-lg font-light leading-relaxed">"Whisk the reetha solution with a wooden spoon until it froths like mountain mist. Apply to wet skin in circular motions."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ritual Timing Section */}
        <section className="py-32 px-6 md:px-16 bg-surface-container-low max-w-[1400px] mx-auto mb-32 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-8 block font-label opacity-60">The Temporal Guide</span>
            <h2 className="text-4xl md:text-7xl font-headline mb-16 tracking-tighter">Ritual Timing &amp; Cycles</h2>
            
            <div className="grid md:grid-cols-2 gap-10 text-left">
              <div className="bg-surface-container-lowest p-12 rounded-2xl shadow-xl border border-outline-variant/20 hover:border-primary/30 transition-all duration-500">
                <div className="flex items-center gap-6 mb-8 text-primary">
                  <span className="material-symbols-outlined text-4xl" data-icon="wb_sunny">wb_sunny</span>
                  <h3 className="text-2xl font-bold font-headline uppercase tracking-wide">The Solar Awaken</h3>
                </div>
                <p className="text-secondary leading-relaxed mb-8 font-light text-lg">Best for the <b>Pure Foam Ritual</b>. As the sun rises, Reetha clears the night's oil and prepares the skin to face the environmental heat of the day.</p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-5 py-2 bg-surface-container-high rounded-full text-[10px] font-bold font-label uppercase tracking-widest">Dawn - 9:00 AM</span>
                  <span className="px-5 py-2 bg-surface-container-high rounded-full text-[10px] font-bold font-label uppercase tracking-widest">Kapha Cycle</span>
                </div>
              </div>
              
              <div className="bg-surface-container-lowest p-12 rounded-2xl shadow-xl border border-outline-variant/20 hover:border-primary/30 transition-all duration-500">
                <div className="flex items-center gap-6 mb-8 text-primary">
                  <span className="material-symbols-outlined text-4xl" data-icon="dark_mode">dark_mode</span>
                  <h3 className="text-2xl font-bold font-headline uppercase tracking-wide">The Lunar Restore</h3>
                </div>
                <p className="text-secondary leading-relaxed mb-8 font-light text-lg">Best for the <b>Deep Cleansing Ritual</b>. Perform during the waning moon to maximize the clay's detoxifying properties and deep release.</p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-5 py-2 bg-surface-container-high rounded-full text-[10px] font-bold font-label uppercase tracking-widest">Dusk - Midnight</span>
                  <span className="px-5 py-2 bg-surface-container-high rounded-full text-[10px] font-bold font-label uppercase tracking-widest">Pitta Release</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
