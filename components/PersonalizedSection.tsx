"use client";
import ProductItem from '@/components/products/ProductItem';
import { Badge } from '@/components/ui/badge';
import { usePersonalization } from '@/lib/hooks/usePersonalization';

// Improvements added:
// - Consistent vertical rhythm & spacing
// - Better skeleton placeholders with proportional shapes
// - More descriptive empty states
// - Accessible section landmarks & aria-labels
// - Slightly wider coupon badges with improved readability
// - Unified card gutters across slider & top deals grid
// - Defensive guards for large arrays (slice to a reasonable preview)

export default function PersonalizedSection() {
  const { recommendations, coupons, topDeals, isLoading, isError } = usePersonalization();

  if (isLoading) {
    return (
      <div className="my-10 space-y-10 animate-pulse">
        <div>
          <div className="h-6 w-60 bg-base-200 rounded mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-40 flex-shrink-0">
                <div className="h-40 w-full bg-base-200 rounded mb-3" />
                <div className="h-4 w-32 bg-base-200 rounded mb-2" />
                <div className="h-3 w-20 bg-base-200 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="h-6 w-56 bg-base-200 rounded mb-4" />
          <div className="flex gap-2 flex-wrap">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-7 w-28 bg-base-200 rounded" />
            ))}
          </div>
        </div>
        <div>
          <div className="h-6 w-52 bg-base-200 rounded mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-44 bg-base-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="my-8 text-sm text-error">
        Could not load personalization right now.
      </div>
    );
  }

  return (
    <section
      aria-label="Personalized shopping section"
      className="my-12 flex flex-col gap-14"
    >
      {/* Recommendations */}
      <div aria-labelledby="perso-recos-heading" className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 id="perso-recos-heading" className="text-2xl font-bold tracking-tight text-base-content">
            Personalized Recommendations
          </h2>
          {recommendations?.length ? (
            <p className="text-xs text-base-content/60">
              Showing {Math.min(recommendations.length, 20)} product
              {recommendations.length === 1 ? '' : 's'} tailored for you
            </p>
          ) : null}
        </div>
        {recommendations?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
            {recommendations.slice(0, 20).map((product: any) => (
              <ProductItem key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-base-content/70 italic">
            No recommendations yet. Browse products to help us learn your taste.
          </p>
        )}
      </div>

      {/* Coupons */}
      <div aria-labelledby="perso-coupons-heading" className="space-y-4">
  <h2 id="perso-coupons-heading" className="text-2xl font-bold tracking-tight text-base-content">
          Exclusive Coupons
        </h2>
        {coupons?.length ? (
          <div className="flex flex-wrap gap-3">
            {coupons.slice(0, 24).map((coupon: any) => {
              const display = coupon.type === 'percentage'
                ? `${coupon.value}% off`
                : coupon.type === 'fixed_amount'
                  ? `Save ₹${coupon.value}`
                  : coupon.type === 'free_shipping'
                    ? 'Free Shipping'
                    : `${coupon.value}`;
              return (
                <Badge
                  key={coupon.code}
                  variant="secondary"
                  className="gap-1 px-3 py-1 rounded-md shadow-sm hover:shadow transition"
                  aria-label={`Coupon ${coupon.code} – ${display}`}
                >
                  <span className="font-mono text-[10px] tracking-wide bg-base-300/70 px-1.5 py-0.5 rounded">
                    {coupon.code}
                  </span>
                  <span className="text-xs font-medium whitespace-nowrap">
                    {display}
                  </span>
                </Badge>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-base-content/70 italic">
            No exclusive coupons right now. Check back soon.
          </p>
        )}
      </div>

      {/* Top Deals */}
      <div aria-labelledby="perso-deals-heading" className="space-y-4">
  <h2 id="perso-deals-heading" className="text-2xl font-bold tracking-tight text-base-content">
          Top Deals For You
        </h2>
        {topDeals?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
            {topDeals.slice(0, 25).map((product: any) => (
              <ProductItem key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-base-content/70 italic">
            No top deals right now. We&apos;ll surface them as they appear.
          </p>
        )}
      </div>
    </section>
  );
}
