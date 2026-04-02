"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { usePersonalization } from '@/lib/hooks/usePersonalization';

interface Product {
  _id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  rating: number;
  category: string;
  brand?: string;
}

interface Coupon {
  _id: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  description?: string;
  expiryDate: string;
}

// Data now comes from shared hook (validation + fallbacks)

export default function PersonalizedRecommendations() {
  const { data: session } = useSession();
  const { recommendations, isLoading, isError } = usePersonalization();

  if (!session) return null;
  if (isLoading) {
    return (
      <div className="py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card bg-base-100 shadow">
                <div className="h-48 bg-gray-200"></div>
                <div className="card-body">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (isError) return null;

  return (
    <div className="py-8 space-y-8">
      {/* Personalized Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 text-accent">✨ Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {recommendations.map((product: any) => (
              <Link key={product._id} href={`/product/${product.slug}`}>
                <div className="card bg-base-300 shadow transition-shadow duration-300 hover:shadow-lg">
                  <figure className="relative img-hover-zoom">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="h-48 w-full object-cover transition-transform duration-500 ease-out"
                    />
                    {/* Recommendation badge */}
                    <div className="absolute top-2 right-2 badge badge-accent text-white font-bold">
                      ✨ For You
                    </div>
                  </figure>
                  <div className="card-body p-4">
                    <h3 className="card-title text-sm font-normal line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-primary' : 'text-gray-300'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-xs text-base-content/60 ml-1">
                          ({product.rating})
                        </span>
                      </div>
                    </div>
                    
                    {/* Brand */}
                    <p className="text-xs text-base-content/70 mb-2 line-clamp-1">
                      {product.brand} • {product.category}
                    </p>
                    
                    {/* Price */}
                    <div className="card-actions flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        ₹{product.price}
                      </span>
                      <div className="badge badge-ghost text-xs">
                        Recommended
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}