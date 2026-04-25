import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
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

  // TODO: Add dynamic product pages
  // const products = await getProducts();
  // const productRoutes = products.map((product) => ({
  //   url: `${baseUrl}/product/${product.slug}`,
  //   lastModified: new Date(product.updatedAt),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.7,
  // }));

  return [...routes];
}
