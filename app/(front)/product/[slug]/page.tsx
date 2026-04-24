import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import AddToCart from '@/components/products/AddToCart';
import { Rating } from '@/components/products/Rating';
import ProductGallery from '@/components/products/ProductGallery';
import productService from '@/lib/services/productService';
import { convertDocToObj, formatPrice } from '@/lib/utils';
import FAQSection from '@/components/footer/FAQ';

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const product = await productService.getBySlug(slug);

  if (!product) {
    return notFound();
  }

  return {
    title: product.name,
    description: product.description,
  };
};

const ProductPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const product = await productService.getBySlug(slug);

  if (!product) {
    return notFound();
  }

  // A curated list of aesthetic complementary texture images
  const complementaryImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBZjpRQ_TLEzEbLXhUI8jizKsyF_CVMSaJxlVGlLEoAX-uQcCw3l3llGXhXh7Yh5HrgccK6rmQ4n-HtB3N0k-ULsDV0c7jBrJx7p00hvGbKjSrxH4ig6FL5ctDt8O7vtJaB9DR3GlI_diNet7fyesaOJ5MUbRkCV5V86klMo14kaexcuO0atkojCqgg3u3Xg2sVe162K_7yswucOyWPLYQz2kAB0BT0JkeXa_53V6Fr-n7zVvHmkpmcHUNMuhzblxQqMliqBcN0BU9T", // Sandalwood log
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBXQhijcmtPtMf8skYc0_3R0py0Ztzsu7U-7gYyYozfnJWbJ782GjNXZhuf8kU9DIiu91Zn1SjEg54kCjAcuTm5iQJQOKMsS5fhwjfObBmBviJOChb0YVH8VhABREKOpV26o-LUGQgaj-jnmdvwJxjXgTRSkphNeXEBhz4689nZtVO-EHZ7Fgcht1PQ1Xu5xYAqeyaYFNff7SFz7akIyoMmA1pGqhMwt9kavFSnvCLy9ZNhJ8VhMWLg4hNaJNJw5-60g0KRiLuA2Qfo", // Clay texture
    "https://lh3.googleusercontent.com/aida-public/AB6AXuATexIdksonwhogQUZmLLaNwoiJWqTCd7laB9bTaVBksXb-6twX9SSMXO89NyPvr6eOg7eXa8_4X9ZVH_wjapZ5mQhFo6GqZutv4lNQFnRr47G4K2-1qrl3mnem5iTr1WZunwusuupDI1urhf_XbHAl_Nh84Ose103uk6NqgBfkB-UQczvkqG5GuqyVeqJvphQPQxGxo8ylSNZpgM1OsHKQu3Qlu7s93SnOm7E1DrzbT55T5bNcFc4YuYDWXBmbtRbvO5nIWy8-TBX3", // Brass Bowl
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCH8AX3rmkoojzeqfztDH33C-ozpMi8xQjEKjhtji4ruOcVsb0954dA2GzcdzSrw46FoznwjkYQZxwfDzwf4QR1UHwHCiW3tS109MOYGYhhgZgDkr23CBEtCAO5qH3esVdkE_Sr1MFgvW1Y-RaTZcYnD7z6zMWMKqNGH6g1l9KSDOISKVP8SBRSwIxD6y2Ul4BZTUJW_rvvdWaeuEQeB3ITG9URJYJq98lm5qkGV0X67XJ49vsGDAc1_E7N2Ty90IEzjdHaU_DvllbV", // Floral Water
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA9ZShktg9GUcLb2eOrOkddW2dKHaW5df84_hyMJ4_iny76Jlo3g0RSniildI26aAFYp4OyhBtLV4RlsV_27bPKmqKhJ2yWQFjECK6Qppsx1oxLg8OTOD1LRjdESdlmhIm_6aPeOIds-UWLg_939XrfV8bg9-tiJU-7ytbxU-m1lVGMrj5peX1BCIRVF862alVtWm1rUjzOkTpF3A3Avh-LDMDhIfDj7YxEXy54zIbYa3ijIk2zNpD36dpXtuxAQcZa62GQY6_lSGWJ", // Paste texture
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBhPBEXj1G62rDU0iDGJDSjpIb0NiNkklq4GEpJoEHx_UzKUrzipedCBalLdbz0JYquLRrDpwgUC7G63jV_tpxr7GWk_uOLqnSH0L_ldJcqfLF0NsPMEnpHjmuasHcOJ_-GBPychyFziPFqaPL59eEVjpmcUYq5njW-3f6P42W6Qyt8AEGpNWNMEb1rKmYn2ilJ5xqCRiHdOS3N4g6LY03oe2876d043IktkMYEJsvIhmBdoqcHHbP_TFDxUG-2d_VqwJE-XNyw4noz" // Leaf bubbles
  ];

  // Deterministically select two unique complementary images based on the product slug
  const seed = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const compImage1 = complementaryImages[seed % complementaryImages.length];
  const compImage2 = complementaryImages[(seed + 1) % complementaryImages.length];

  return (
    <div className="pt-8 md:pt-12 pb-12 overflow-x-hidden">
      {/* Product Section */}
      <section className="max-w-screen-2xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
        {/* Product Gallery (Interactive) */}
        <ProductGallery 
          images={[
            /^(\/|https?:)/.test(product.image) ? product.image : '/images/banner/banner0.jpg',
            compImage1,
            compImage2
          ]} 
        />

        {/* Product Info */}
        <div className="lg:col-span-7 flex flex-col space-y-8 mt-8 lg:mt-0">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {product.countInStock > 0 ? (
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">In Stock</span>
              ) : (
                <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Out of Stock</span>
              )}
              <div className="flex items-center text-primary">
                 <Rating 
                    value={product.rating}
                    caption={`${product.numReviews} reviews`}
                 />
              </div>
            </div>
            <h1 className="font-headline text-4xl md:text-5xl text-primary tracking-tighter italic leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-body font-light text-on-surface">{formatPrice(product.price)}</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-label uppercase text-[10px] tracking-widest text-on-surface-variant">Ancient Wisdom</h3>
            <p className="text-on-surface-variant leading-relaxed text-lg">
              {product.description}
            </p>
          </div>

          {/* Selectors */}
          <div className="space-y-6 pt-4">
            {product.countInStock > 0 && (
               <AddToCart
                 item={{
                   ...convertDocToObj(product),
                   qty: 0,
                   color: '',
                   size: '',
                 }}
               />
            )}
          </div>

          {/* Chips (Ingredients) */}
          <div className="flex flex-wrap gap-2 pt-4">
            <span className="bg-surface-container-high text-on-surface px-3 py-1 rounded-full text-[11px] font-medium tracking-wide">Sandalwood</span>
            <span className="bg-surface-container-high text-on-surface px-3 py-1 rounded-full text-[11px] font-medium tracking-wide">Multani Mitti</span>
            <span className="bg-surface-container-high text-on-surface px-3 py-1 rounded-full text-[11px] font-medium tracking-wide">Soapnut</span>
            <span className="bg-surface-container-high text-on-surface px-3 py-1 rounded-full text-[11px] font-medium tracking-wide">Wild Honey</span>
          </div>
        </div>
      </section>

      {/* Detailed Content Tabs */}
      <section className="mt-24 bg-surface-container-low relative py-20">
        <div className="absolute inset-0 pointer-events-none noise-overlay opacity-[0.03]"></div>
        <div className="max-w-4xl mx-auto px-6 relative">
          <div className="flex border-b border-outline-variant/20 mb-12 overflow-x-auto scrollbar-hide">
            <button className="px-8 pb-4 text-primary border-b-2 border-primary font-headline italic text-xl whitespace-nowrap">The Ritual</button>
            <button className="px-8 pb-4 text-on-surface-variant hover:text-primary font-headline italic text-xl transition-colors whitespace-nowrap">Ingredients</button>
            <button className="px-8 pb-4 text-on-surface-variant hover:text-primary font-headline italic text-xl transition-colors whitespace-nowrap">Our Ethics</button>
          </div>
          <div className="space-y-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="font-headline text-3xl text-primary italic leading-tight">Cleansing as Meditation</h2>
                <p className="text-on-surface-variant leading-relaxed">
                  Dispense a small amount onto your palm or a natural loofah. Massage onto damp skin in gentle circular motions, focusing on areas that hold tension. Inhale the grounding scent of sandalwood. Rinse with lukewarm water to reveal skin that feels soft, detoxified, and deeply nourished.
                </p>
              </div>
              <div className="rounded-lg overflow-hidden aspect-square shadow-xl">
                <Image 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRSmWpCzGLgiS4xXmXgcabj9yx-1jx55OCHnwhDI3KqgH2AC44z2R07FpIInuLyJ7I4r6s6JSVjFP_LXmVVWBNjVTxxt5nA5rD4S21VwQUkW8jdtrSvyrLHXPYxV639zShq0Z99BvF5UqyfftFQJGSkv4TBKKzzLLgNxevvtTYnsjff9KUK0MtUGHeWc1Sh_yMDO05HjHhBZmd9BVWQtvR47azLXZo3mNeIPaTGYd2EVsEV_ByExW58R37rG_PJLipBo71W9uwSoEF"
                  alt="Ritual cleansing"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products (Bento/Card Style) */}
      <section className="mt-24 max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-2">
            <h3 className="font-label uppercase text-[10px] tracking-widest text-on-surface-variant">Complete the Set</h3>
            <h2 className="font-headline text-4xl text-primary italic">Complementary Rituals</h2>
          </div>
          <div className="hidden md:flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant/20 hover:border-primary transition-all">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant/20 hover:border-primary transition-all">
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <Link href="/shop" className="group cursor-pointer">
            <div className="bg-surface-container-low aspect-[3/4] rounded-lg overflow-hidden mb-6 relative">
              <Image 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvfZ1HRdQkI-sVHntwLxpzLEcYC1r9WGAxunHcir3JCrd3SkPGGpb6_fL5UpXpWqKGvMnrxJmBLdv6StBXOot3bfM-25YSqBfeDul3NJRrrKn4WBA3L5NHYeKQ9p-91EPj0GabLT48hIais8eEVZd5yTqlyFX-QgzxdAJRL2dh5isAxhFi0TChkZA_sL4cbE6SkdyIGXZAGR-8mzeF3iKCG3k9OO83hd6Uf1Otoq0ayh4skK4lrd9PtO6yCAVZ6YRaLMIVbV0_SwI5"
                alt="Body Scrub"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700" 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <h4 className="font-headline text-2xl text-primary italic">Mitti Polish Body Scrub</h4>
            <p className="text-on-surface-variant font-body text-sm mt-1">Refining Clay & Walnut</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-medium">₹1,450.00</span>
              <span className="text-[10px] font-label uppercase tracking-widest text-primary border-b border-primary/20 pb-1">Quick View</span>
            </div>
          </Link>
          {/* Card 2 */}
          <Link href="/shop" className="group cursor-pointer">
            <div className="bg-surface-container-low aspect-[3/4] rounded-lg overflow-hidden mb-6 relative">
              <Image 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8sgx9kGEcknuqTJQdZ2BJNzl8qxNV8YlktQzPmzphSqdjvrg8LC88pGNxXvsahm1HpgPSEujoykTjvfRO5nMHnlE7crED6NEkzpmOLl1m-yCFZ6w95R6oH43kGU9Tu4B-S2UghiVEXZOkBl_yhO3KHsKo4ctU3_fIj1aoL1dp58795RKSn_eYTKmceZSGM8mjMiXlyoYOsfDMKTcXt0sERoEz4YZLgSMoHzS3SdDQHPaMI_Nz76CqBfLHwt7pNFeP0_ukbVjoCtdx"
                alt="Face Wash"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700" 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <h4 className="font-headline text-2xl text-primary italic">Pure Reetha Face Wash</h4>
            <p className="text-on-surface-variant font-body text-sm mt-1">Soapnut & Vetiver</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-medium">₹1,250.00</span>
              <span className="text-[10px] font-label uppercase tracking-widest text-primary border-b border-primary/20 pb-1">Quick View</span>
            </div>
          </Link>
          {/* Card 3 (Visual Placeholder for Asymmetry) */}
          <div className="hidden lg:flex bg-secondary-container/20 rounded-lg p-12 flex-col justify-center space-y-6">
            <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            <h4 className="font-headline text-3xl text-primary italic leading-tight">The Sustainable Standard</h4>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Every bottle is infinitely recyclable glass, and every purchase contributes to sandalwood reforestation programs in the Western Ghats.
            </p>
            <Link href="/about" className="text-[10px] font-label uppercase tracking-widest text-primary underline underline-offset-8">Our Journey</Link>
          </div>
        </div>
      </section>

      <div className="mt-24 max-w-screen-2xl mx-auto px-6 md:px-12 border-t border-outline-variant/20 pt-16">
        <FAQSection />
      </div>
    </div>
  );
};

export default ProductPage;
