import { Metadata } from 'next';
import { brandName, brandTagline, shopAddress } from './brand';

export const siteConfig = {
  name: brandName,
  description: brandTagline,
  url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  ogImage: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/images/og-image.jpg`,
  links: {
    twitter: 'https://twitter.com/aetheravia',
    instagram: 'https://instagram.com/aetheravia',
    facebook: 'https://facebook.com/aetheravia',
  },
};

export function constructMetadata({
  title = `${brandName} - ${brandTagline}`,
  description = `Discover ${brandName}, your destination for natural skincare and body care. Premium botanical formulations with free shipping across India. Located at ${shopAddress}`,
  image = siteConfig.ogImage,
  icons = '/favicon.ico',
  noIndex = false,
  keywords = [
    'natural skincare',
    'body care products',
    'botanical formulations',
    'online beauty store',
    'clean beauty India',
    'organic skincare',
    'sustainable beauty',
    'skincare routine',
    brandName,
  ],
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
  keywords?: string[];
} = {}): Metadata {
  return {
    title: {
      default: title,
      template: `%s | ${brandName}`,
    },
    description,
    keywords: keywords.join(', '),
    authors: [{ name: brandName }],
    creator: brandName,
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: siteConfig.url,
      title,
      description,
      siteName: brandName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@aetheravia',
    },
    icons,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: siteConfig.url,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
    manifest: '/manifest.json',
  };
}

// JSON-LD Schema for Organization
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: brandName,
    description: brandTagline,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/logo.png`,
    image: siteConfig.ogImage,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Near Pal Petrol pump, Bisalpur',
      addressLocality: 'Pilibhit',
      addressRegion: 'Uttar Pradesh',
      postalCode: '262201',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+91-9876543210',
      email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@aetheravia.com',
      contactType: 'Customer Service',
      availableLanguage: ['English', 'Hindi'],
      areaServed: 'IN',
    },
    priceRange: '₹₹-₹₹₹',
    openingHours: 'Mo-Su 09:00-21:00',
    sameAs: [
      siteConfig.links.facebook,
      siteConfig.links.instagram,
      siteConfig.links.twitter,
    ],
  };
}
