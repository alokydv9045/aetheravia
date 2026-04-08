import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Phone,
  CreditCard,
  Shield,
  Truck,
  RotateCcw,
  Heart,
  Leaf,
  Award,
  CheckCircle,
  Star
} from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { brandEmail } from '@/lib/brand';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">

          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">
                  {(process.env.NEXT_PUBLIC_BRAND_NAME || 'AE').slice(0,2).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  AETHRAVIA
                </h3>
                <p className="text-xs text-slate-600">Premium Natural Skincare</p>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
              {process.env.NEXT_PUBLIC_BRAND_TAGLINE || 'Discover the power of nature with our carefully curated collection of premium skincare products.'}
            </p>

            <div className="flex space-x-2">
              <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-all duration-200 rounded-md">
                <Facebook className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-all duration-200 rounded-md">
                <Instagram className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-all duration-200 rounded-md">
                <Twitter className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-all duration-200 rounded-md">
                <Youtube className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-slate-600 border-b border-green-200 pb-1">Products</h4>
            <ul className="space-y-2">
              {[
                { name: 'Face Care', href: '/search?category=face' },
                { name: 'Body Care', href: '/search?category=body' },
                { name: 'Hair Care', href: '/search?category=hair' },
                { name: 'Natural Oils', href: '/search?category=oils' },
                { name: 'Skincare Sets', href: '/search?category=sets' },
                { name: 'New Arrivals', href: '/search?sort=newest' }
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-600 hover:text-green-600 transition-colors text-sm hover:underline decoration-green-300 underline-offset-2"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-slate-600 border-b border-green-200 pb-1">Support</h4>
            <ul className="space-y-2">
              {[
                { name: 'Contact Us', href: `mailto:${brandEmail}` },
                { name: 'FAQs', href: '#faqs' },
                { name: 'Shipping Info', href: '/shipping' },
                { name: 'Returns', href: '/returns' },
                { name: 'Order Tracking', href: '/track' },
                { name: 'Size Guide', href: '/help' }
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-600 hover:text-green-600 transition-colors text-sm hover:underline decoration-green-300 underline-offset-2"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-slate-600 border-b border-green-200 pb-1">Stay Connected</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Get exclusive access to new products and skincare tips.
            </p>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500/20 rounded-md h-9"
              />
              <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-md h-9 shadow-sm hover:shadow-md transition-all duration-200 text-sm">
                Subscribe
              </Button>
            </div>

            {/* Contact Info */}
            <div className="pt-2 space-y-1">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Phone className="h-3 w-3 text-green-600" />
                <span className="text-xs">{process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+91-XXXX-XXXXXX'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Mail className="h-3 w-3 text-green-600" />
                <span className="text-xs truncate">{brandEmail}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust & Payment Section */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Trust Badges */}
            <div>
              <h5 className="text-sm font-semibold text-slate-600 mb-3">Why Choose AETHRAVIA?</h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Truck className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-xs">Free Shipping</p>
                    <p className="text-xs">On orders over ₹999</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <RotateCcw className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-xs">Easy Returns</p>
                    <p className="text-xs">30-day return policy</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Shield className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-xs">Secure Shopping</p>
                    <p className="text-xs">256-bit SSL encryption</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Star className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-xs">Quality Assured</p>
                    <p className="text-xs">Premium ingredients only</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h5 className="text-sm font-semibold text-slate-600 mb-3">Accepted Payments</h5>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Visa', 'Mastercard', 'American Express', 'Razorpay',
                  'Google Pay', 'PhonePe', 'Paytm', 'UPI'
                ].map((payment) => (
                  <Badge
                    key={payment}
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:border-green-300 hover:bg-green-50 px-2 py-0.5 rounded text-xs font-medium"
                  >
                    {payment}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex items-center space-x-2">
                <Shield className="h-3 w-3 text-green-500" />
                <span className="text-xs text-slate-600">Your payment information is secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-200" />

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-2 lg:space-y-0">
          <div className="flex flex-wrap justify-center lg:hidden space-x-4 text-xs text-slate-600">
            <Link href="#" className="hover:text-green-600 transition-colors hover:underline decoration-green-300 underline-offset-2">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-green-600 transition-colors hover:underline decoration-green-300 underline-offset-2">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-green-600 transition-colors hover:underline decoration-green-300 underline-offset-2">
              Cookie Policy
            </Link>
            <Link href="#" className="hover:text-green-600 transition-colors hover:underline decoration-green-300 underline-offset-2">
              Accessibility
            </Link>
          </div>
          <div className="text-center lg:text-right">
            <p className="text-xs text-slate-600">
              © {currentYear} AETHRAVIA. All rights reserved.
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Made with <span className="text-red-400">♥</span> for beautiful, healthy skin
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
