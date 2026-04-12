import { Metadata } from 'next';
import { Suspense } from 'react';
import ProductItems, { ProductItemsSkeleton } from '@/components/products/ProductItems';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Aethravia | The Artisanal Archive',
  description: 'Explore our hand-poured formulas inspired by ancient Vedic rituals and the raw textures of Bharat.',
};

const ShopPage = async (props: {
  searchParams: Promise<{ category?: string; q?: string }>
}) => {
  const searchParams = await props.searchParams;
  const currentCategory = searchParams.category || 'all';
  const currentQuery = searchParams.q || 'all';

  const categories = [
    { name: 'All Products', icon: 'grid_view', slug: 'all' },
    { name: 'Body Wash', icon: 'waves', slug: 'Body Wash' },
    { name: 'Body Scrub', icon: 'texture', slug: 'Body Scrub' },
    { name: 'Face Wash', icon: 'face', slug: 'Face Wash' }
  ];

  const featuredIngredients = [
    'Multani Mitti',
    'Chandan (Sandalwood)',
    'Reetha (Soapnut)'
  ];

  return (
    <div className='min-h-screen bg-surface font-body text-on-surface relative overflow-hidden'>
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 noise-overlay opacity-[0.03] pointer-events-none z-0"></div>

      <main className="pt-28 pb-32 px-6 max-w-screen-2xl mx-auto relative z-10">
        {/* Page Header Section */}
        <section className="mb-24 md:flex items-end justify-between">
          <div className="max-w-2xl">
            <span className="text-secondary font-label text-xs uppercase tracking-[0.4em] mb-6 block">The Artisanal Archive</span>
            <h1 className="text-6xl md:text-8xl font-headline tracking-tighter text-primary leading-[0.9]">
              Earthy <br/><span className="italic font-normal">Essentials</span>
            </h1>
          </div>
          <div className="mt-8 md:mt-0 md:mb-4">
            <p className="text-secondary/70 font-body max-w-xs leading-relaxed border-l-2 border-outline/30 pl-8 italic">
              Hand-poured formulas inspired by ancient Vedic rituals and the raw textures of Bharat.
            </p>
          </div>
        </section>

        {/* Product Grid / Bento Style Integration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Sidebar / Filter Column */}
          <aside className="lg:col-span-3 space-y-12">
            <div>
              <nav className="flex flex-col space-y-4">
                {categories.map((item) => {
                  const isActive = currentCategory === item.slug;
                  return (
                    <Link 
                      key={item.name}
                      href={item.slug === 'all' 
                        ? (currentQuery === 'all' ? '/shop' : `/shop?q=${encodeURIComponent(currentQuery)}`)
                        : `/shop?category=${encodeURIComponent(item.slug)}${currentQuery !== 'all' ? `&q=${encodeURIComponent(currentQuery)}` : ''}`
                      }
                      className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all border ${
                        isActive 
                        ? 'bg-surface-container-low border-primary/20 text-primary font-headline font-bold' 
                        : 'border-transparent text-secondary/70 hover:text-primary hover:bg-surface-container-lowest'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-lg">{item.icon}</span>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Featured Ingredients Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-secondary/40 font-bold">Featured Ingredients</h3>
                {currentQuery !== 'all' && (
                  <Link 
                    href={currentCategory === 'all' ? '/shop' : `/shop?category=${encodeURIComponent(currentCategory)}`}
                    className="text-[10px] text-primary underline underline-offset-4 font-bold"
                  >
                    Clear
                  </Link>
                )}
              </div>
              <div className="flex flex-col space-y-5 px-4">
                {featuredIngredients.map((ingredient) => {
                  const isActive = currentQuery === ingredient;
                  return (
                    <Link 
                      key={ingredient} 
                      href={isActive 
                        ? (currentCategory === 'all' ? '/shop' : `/shop?category=${encodeURIComponent(currentCategory)}`)
                        : `/shop?q=${encodeURIComponent(ingredient)}${currentCategory !== 'all' ? `&category=${encodeURIComponent(currentCategory)}` : ''}`
                      }
                      className="flex items-center gap-4 cursor-pointer group"
                    >
                      <div className={`w-5 h-5 border rounded flex items-center justify-center transition-colors ${
                        isActive ? 'border-primary bg-primary/5' : 'border-outline/30 group-hover:border-primary'
                      }`}>
                        <div className={`w-2.5 h-2.5 bg-primary rounded-sm transition-opacity ${
                          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-10'
                        }`}></div>
                      </div>
                      <span className={`text-sm transition-colors ${
                        isActive ? 'text-primary font-bold' : 'text-secondary/80 group-hover:text-primary'
                      }`}>
                        {ingredient}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Ritual Guide Block */}
            <div className="bg-surface-container-low p-10 rounded-xl relative overflow-hidden group shadow-sm mt-32">
              <div className="relative z-10">
                <h4 className="font-headline text-2xl mb-4">Ritual Guide</h4>
                <p className="text-sm text-secondary/70 mb-8 leading-relaxed">Discover the ancient sequence for your skin's unique journey.</p>
                <button className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-3 group-hover:gap-5 transition-all">
                  Take Quiz <ArrowRight size={14} />
                </button>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-[0.05] group-hover:scale-110 transition-all duration-1000">
                <span className="material-symbols-outlined text-9xl">spa</span>
              </div>
            </div>
          </aside>

          {/* Main Product Area */}
          <div className="lg:col-span-9">
            <Suspense key={`${currentCategory}-${currentQuery}`} fallback={<ProductItemsSkeleton qty={6} layout="grid" />}>
              <ProductItems 
                layout="grid" 
                title={currentQuery !== 'all' ? currentQuery.split(' (')[0] : (currentCategory === 'all' ? 'Signature' : currentCategory)}
                highlight={currentQuery !== 'all' ? 'Featured' : (currentCategory === 'all' ? 'Harvest' : 'Collection')} 
                category={currentCategory}
                q={currentQuery}
              />
            </Suspense>

            {/* Bento-Style Lifestyle Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-32">
              <div className="relative aspect-video rounded-xl overflow-hidden group shadow-xl">
                <img 
                  className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 scale-105 group-hover:scale-100" 
                  alt="Artisanal Mixing Process" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaRaIhIcep2diu90OEl0_ZXrqTG0hZRjmQ_f2QJCLnHKR6ZP0ZTRYowQBCrjmMs-VSb0eDJrzdMmciwhxtPdXCQilj7mAIZJQ51nRC35S16hitdFZ0o_wbmu2oF58BmoS90NZqCph6nNNlsvYU3gSgXgSh9dUzGx_8wNM08LxxheWbUjYq-rhps5kKlLWutsFFDHNPmF1dvFjxM9PyGDB5frZFVZLqU6TJ88GWyo33hcna-UkKE0w4Mnuc6Q3vcj7-Io7ayEYA8IVg" 
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply opacity-50"></div>
                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <h4 className="font-headline text-4xl text-white mb-3">Our Process</h4>
                  <p className="text-white/90 font-body text-sm max-w-xs leading-relaxed">Each small batch is energized with mantras and aged in earthen pots for lunar potency.</p>
                </div>
              </div>

              <div className="bg-surface-container-high p-12 rounded-xl flex flex-col justify-center space-y-8 shadow-sm">
                <span className="material-symbols-outlined text-5xl text-primary animate-bounce">eco</span>
                <div className="space-y-4">
                  <h4 className="font-headline text-3xl text-primary">Consciously Crafted</h4>
                  <p className="text-secondary/80 leading-relaxed font-body text-lg">We source directly from farm cooperatives across the Deccan Plateau, ensuring every ingredient tells a story of fair trade and soil health.</p>
                </div>
                <button className="inline-flex items-center gap-2 font-bold uppercase tracking-[0.2em] text-[10px] border-b-2 border-primary pb-2 text-primary hover:gap-4 transition-all w-fit">
                  Trace our origin
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Integrated Sourcing Ritual (Original Content) */}
        <section className="mt-32 pt-24 border-t border-primary/10 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 relative">
              <div className="absolute -left-6 -top-6 w-full h-full border border-primary/5 rounded-sm z-0"></div>
              <div className="relative z-10 aspect-[4/5] overflow-hidden rounded-sm shadow-xl">
                <img 
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-[1.02]" 
                  alt="The Handcrafted Ritual" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQpPPJql9_6H8pBZLKm3_1jWwxmxBmt63z7I470B1lOyCkgf-Ir8WR8LPrnP-ELKuX9iWoWxdj8Ip86odvjL42GsZoSAC7lOHto4wzDlYlKIxYpal2_rAeOP9TZ9axjGZ-pGdm5gS83AWb79Qp1bTwoo9u6IOckDPt6BAnIvaWlOayUhvaot1mgCZCGUMs91DekBD_8RV6KmVnoJ8EKwFKFQaP588VFHL_hgGMS_6s3G8zpLFikgAjw21f26RqtCyWy3RfSl4hAf1T" 
                />
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-secondary/40">Heritage Philosophy</span>
                <h2 className="font-serif text-4xl md:text-5xl text-primary leading-tight">The Sourcing Ritual</h2>
              </div>
              
              <p className="text-lg text-secondary/70 leading-relaxed font-medium">
                Every batch of our 'Essential Three' starts at the source. We partner with small-scale cultivators in Rajasthan for our Multani Mitti and ethically sourced Sandalwood from Mysore to ensure every drop carries the archive of our heritage.
              </p>

              <div className="grid grid-cols-2 gap-10 pt-6">
                <div className="space-y-2">
                  <span className="block text-4xl font-serif text-primary">100%</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-secondary font-bold opacity-60">Cold-Pressed Extracts</span>
                </div>
                <div className="space-y-2">
                  <span className="block text-4xl font-serif text-primary">Zero</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-secondary font-bold opacity-60">Synthetic Fragrance</span>
                </div>
              </div>

              <div className="pt-8">
                <button className="flex items-center gap-4 text-primary font-bold text-[10px] tracking-[0.3em] uppercase group">
                  Explore Sourcing 
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-3" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ShopPage;