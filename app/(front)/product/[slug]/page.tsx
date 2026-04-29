import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import AddToCart from '@/components/products/AddToCart';
import { Rating } from '@/components/products/Rating';
import ProductGallery from '@/components/products/ProductGallery';
import WishlistButton from '@/components/products/WishlistButton';
import ProductItem from '@/components/products/ProductItem';
import productService, { enhanceWithOffers } from '@/lib/services/productService';
import { convertDocToObj, formatPrice } from '@/lib/utils';
import FAQSection from '@/components/footer/FAQ';
import ProductTabs from '@/components/products/ProductTabs';
import ProductModel from '@/lib/models/ProductModel';
import { Zap, Ticket } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  // Offer Logic
  const hasOffer = product.activeOffer && product.activeOffer.discountPercentage > 0;
  const discountedPrice = hasOffer 
    ? product.price * (1 - product.activeOffer!.discountPercentage / 100) 
    : product.price;

  // A curated list of aesthetic complementary texture images
  const complementaryImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBZjpRQ_TLEzEbLXhUI8jizKsyF_CVMSaJxlVGlLEoAX-uQcCw3l3llGXhXh7Yh5HrgccK6rmQ4n-HtB3N0k-ULsDV0c7jBrJx7p00hvGbKjSrxH4ig6FL5ctDt8O7vtJaB9DR3GlI_diNet7fyesaOJ5MUbRkCV5V86klMo14kaexcuO0atkojCqgg3u3Xg2sVe162K_7yswucOyWPLYQz2kAB0BT0JkeXa_53V6Fr-n7zVvHmkpmcHUNMuhzblxQqMliqBcN0BU9T",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBXQhijcmtPtMf8skYc0_3R0py0Ztzsu7U-7gYyYozfnJWbJ782GjNXZhuf8kU9DIiu91Zn1SjEg54kCjAcuTm5iQJQOKMsS5fhwjfObBmBviJOChb0YVH8VhABREKOpV26o-LUGQgaj-jnmdvwJxjXgTRSkphNeXEBhz4689nZtVO-EHZ7Fgcht1PQ1Xu5xYAqeyaYFNff7SFz7akIyoMmA1pGqhMwt9kavFSnvCLy9ZNhJ8VhMWLg4hNaJNJw5-60g0KRiLuA2Qfo",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuATexIdksonwhogQUZmLLaNwoiJWqTCd7laB9bTaVBksXb-6twX9SSMXO89NyPvr6eOg7eXa8_4X9ZVH_wjapZ5mQhFo6GqZutv4lNQFnRr47G4K2-1qrl3mnem5iTr1WZunwusuupDI1urhf_XbHAl_Nh84Ose103uk6NqgBfkB-UQczvkqG5GuqyVeqJvphQPQxGxo8ylSNZpgM1OsHKQu3Qlu7s93SnOm7E1DrzbT55T5bNcFc4YuYDWXBmbtRbvO5nIWy8-TBX3",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCH8AX3rmkoojzeqfztDH33C-ozpMi8xQjEKjhtji4ruOcVsb0954dA2GzcdzSrw46FoznwjkYQZxwfDzwf4QR1UHwHCiW3tS109MOYGYhhgZgDkr23CBEtCAO5qH3esVdkE_Sr1MFgvW1Y-RaTZcYnD7z6zMWMKqNGH6g1l9KSDOISKVP8SBRSwIxD6y2Ul4BZTUJW_rvvdWaeuEQeB3ITG9URJYJq98lm5qkGV0X67XJ49vsGDAc1_E7N2Ty90IEzjdHaU_DvllbV",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA9ZShktg9GUcLb2eOrOkddW2dKHaW5df84_hyMJ4_iny76Jlo3g0RSniildI26aAFYp4OyhBtLV4RlsV_27bPKmqKhJ2yWQFjECK6Qppsx1oxLg8OTOD1LRjdESdlmhIm_6aPeOIds-UWLg_939XrfV8bg9-tiJU-7ytbxU-m1lVGMrj5peX1BCIRVF862alVtWm1rUjzOkTpF3A3Avh-LDMDhIfDj7YxEXy54zIbYa3ijIk2zNpD36dpXtuxAQcZa62GQY6_lSGWJ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBhPBEXj1G62rDU0iDGJDSjpIb0NiNkklq4GEpJoEHx_UzKUrzipedCBalLdbz0JYquLRrDpwgUC7G63jV_tpxr7GWk_uOLqnSH0L_ldJcqfLF0NsPMEnpHjmuasHcOJ_-GBPychyFziPFqaPL59eEVjpmcUYq5njW-3f6P42W6Qyt8AEGpNWNMEb1rKmYn2ilJ5xqCRiHdOS3N4g6LY03oe2876d043IktkMYEJsvIhmBdoqcHHbP_TFDxUG-2d_VqwJE-XNyw4noz"
  ];

  const seed = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const compImage1 = complementaryImages[seed % complementaryImages.length];
  const compImage2 = complementaryImages[(seed + 1) % complementaryImages.length];

  let rawRelated = await ProductModel.find({ 
    category: product.category,
    _id: { $ne: product._id } 
  }).limit(8).lean();

  if (rawRelated.length === 0) {
    rawRelated = await ProductModel.find({ 
      _id: { $ne: product._id } 
    }).limit(8).lean();
  }

  const relatedProducts = await enhanceWithOffers(rawRelated);

  const isPlaceholder = !product.image || product.image.includes('cosmetics-composition-with-serum-bottles.jpg');
  const galleryImages = [
    ...(isPlaceholder ? [] : [product.image]),
    ...(product.images || [])
  ].filter((img, index, self) => 
    img && self.indexOf(img) === index
  );

  return (
    <div className="pt-8 md:pt-12 pb-12 overflow-x-hidden">
      <section className="max-w-screen-2xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
        <ProductGallery images={galleryImages.length > 0 ? galleryImages : ['/images/banner/banner0.jpg']} />

        <div className="lg:col-span-7 flex flex-col space-y-8 mt-8 lg:mt-0">
            <div className="flex items-center gap-3">
              {product.countInStock > 0 ? (
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">In Stock</span>
              ) : (
                <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Out of Stock</span>
              )}
              {hasOffer && (
                <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 animate-pulse">
                  <Zap size={10} fill="currentColor" />
                  {product.activeOffer?.title}
                </span>
              )}
              <div className="flex items-center text-primary">
                 <Rating value={product.rating} caption={`${product.numReviews} reviews`} />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="font-headline text-4xl md:text-5xl text-primary tracking-tighter italic leading-tight">
                {product.name}
              </h1>
              {hasOffer && product.activeOffer?.promoCode && (
                <div className="flex items-center gap-2 text-primary">
                  <Ticket size={14} className="opacity-60" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Unlock with code: {product.activeOffer.promoCode}</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-4">
              <p className="text-4xl font-body font-bold text-primary">{formatPrice(discountedPrice)}</p>
              {hasOffer && (
                <div className="flex items-center gap-3">
                  <span className="text-xl font-body text-secondary/40 line-through decoration-2">{formatPrice(product.price)}</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-bold text-xs uppercase">Save {product.activeOffer?.discountPercentage}%</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-label uppercase text-[10px] tracking-widest text-on-surface-variant">Ancient Wisdom</h3>
              <p className="text-on-surface-variant leading-relaxed text-lg">{product.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 items-stretch sm:items-center">
              {product.countInStock > 0 && (
                 <div className="flex-1">
                   <AddToCart
                     item={{
                       ...convertDocToObj(product),
                       price: discountedPrice,
                       qty: 0,
                       color: '',
                       mlQuantity: '',
                     }}
                   />
                 </div>
              )}
              <WishlistButton product={convertDocToObj(product)} />
            </div>

            <div className="flex flex-wrap gap-2 pt-4">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase">{product.brand}</span>
              <span className="bg-surface-container-high text-on-surface px-3 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase">{product.category}</span>
            </div>
        </div>
      </section>

      <ProductTabs description={product.description} />

      <section className="mt-24 max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-2">
            <h3 className="font-label uppercase text-[10px] tracking-widest text-on-surface-variant">Complete the Set</h3>
            <h2 className="font-headline text-4xl text-primary italic">Complementary Products</h2>
          </div>
          <div className="hidden md:flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant/20 hover:border-primary transition-all"><span className="material-symbols-outlined text-sm">arrow_back</span></button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant/20 hover:border-primary transition-all"><span className="material-symbols-outlined text-sm">arrow_forward</span></button>
          </div>
        </div>
        <div className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide snap-x snap-mandatory">
          {relatedProducts.length > 0 ? (
            relatedProducts.map((relProduct: any) => (
              <div key={relProduct._id} className="shrink-0 w-[240px] snap-start">
                <ProductItem product={convertDocToObj(relProduct)} />
              </div>
            ))
          ) : (
            <div className="w-full text-center py-12 bg-surface-container-low rounded-lg border border-dashed border-outline-variant/30">
              <span className="material-symbols-outlined text-4xl text-outline-variant/50 mb-3">inventory_2</span>
              <p className="text-on-surface-variant font-body">Exploring more treasures soon...</p>
            </div>
          )}
        </div>
      </section>

      <div className="mt-24 max-w-screen-2xl mx-auto px-6 md:px-12 border-t border-outline-variant/20 pt-16">
        <FAQSection />
      </div>
    </div>
  );
};

export default ProductPage;
