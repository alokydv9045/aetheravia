import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const routes = [
    {
      path: '',
      changeFreq: 'daily' as const,
      priority: 1,
    },
    {
      path: '/cart',
      changeFreq: 'weekly' as const,
      priority: 0.8,
    },
    {
      path: '/signin',
      changeFreq: 'weekly' as const,
      priority: 0.5,
    },
    {
      path: '/register',
      changeFreq: 'weekly' as const,
      priority: 0.5,
    },
    {
      path: '/shipping',
      changeFreq: 'monthly' as const,
      priority: 0.6,
    },
    {
      path: '/payment',
      changeFreq: 'monthly' as const,
      priority: 0.6,
    },
    {
      path: '/place-order',
      changeFreq: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/order-history',
      changeFreq: 'weekly' as const,
      priority: 0.7,
    },
    {
      path: '/profile',
      changeFreq: 'weekly' as const,
      priority: 0.6,
    },
    {
      path: '/help',
      changeFreq: 'monthly' as const,
      priority: 0.5,
    },
  ].map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));

  // Fetch all product slugs for dynamic routes
  let productRoutes: { url: string; lastModified: Date; changeFrequency: "weekly"; priority: number }[] = [];
  try {
    const products = await import("@/lib/models/ProductModel").then((mod) => mod.default);
    await import("@/lib/dbConnect").then((mod) => mod.default());
    
    const allProducts = await products.find({}).select("slug updatedAt").lean();
    productRoutes = allProducts.map((product: any) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Failed to fetch products for sitemap:", error);
  }

  return [...routes, ...productRoutes];
}
