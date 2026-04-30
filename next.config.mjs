// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for Render
  output: 'standalone',
  staticPageGenerationTimeout: 300,
  
  // Handle large external packages like mongoose
  serverExternalPackages: ['mongoose'],
  
  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
    cpus: 1, // Mitigate WorkerError on Windows by using a single worker
  },
  
  // Webpack configuration for better module resolution
  webpack: (config, { isServer }) => {
    // Handle case sensitivity issues
    config.resolve.symlinks = false;
    
    // Add fallbacks for node modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true, // Temporarily bypass to isolate WorkerError on Windows
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const common = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ];
    const cspProd = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob: res.cloudinary.com lh3.googleusercontent.com",
      "connect-src 'self' api.razorpay.com lumberjack.razorpay.com https://api.cloudinary.com https://api.postalpincode.in",
      "frame-src checkout.razorpay.com api.razorpay.com https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; ');
    const cspDev = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://vercel.live checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob: res.cloudinary.com lh3.googleusercontent.com",
      "connect-src 'self' ws: wss: http://localhost:* https://vercel.live api.razorpay.com lumberjack.razorpay.com https://api.cloudinary.com https://api.postalpincode.in",
      "frame-src 'self' checkout.razorpay.com api.razorpay.com https://www.google.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors *",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          ...common,
          ...(isProd
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
            : []),
          { key: 'Content-Security-Policy', value: isProd ? cspProd : cspDev },
        ],
      },
    ];
  },
  // experimental: {
  //   ppr: true,
  // },
};

export default nextConfig;
