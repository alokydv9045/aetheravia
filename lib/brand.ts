// Centralized brand helper for UI & server usage
// Uses NEXT_PUBLIC_* so it works on client and server in Next.js

export const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'AETHRAVIA';
export const brandTagline = process.env.NEXT_PUBLIC_BRAND_TAGLINE || 'Embrace the earth, unveil your personality';
export const shopAddress = process.env.NEXT_PUBLIC_SHOP_ADDRESS || '46, Mohalla Mohammad Wasil Near Hadri Masjib, Pilibhit, UP-262001';

export const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/gi, '').trim();
export const brandEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'heukcare@gmail.com';

export const storeName = process.env.STORE_NAME || 'Heuk Care PVT. LTD.';
export const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+91-XXXX-XXXXXX';
