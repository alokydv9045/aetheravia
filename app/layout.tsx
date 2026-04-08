import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';

import DrawerButton from '@/components/DrawerButton';
import Footer from '@/components/footer/Footer';
import Header from '@/components/header/Header';
import Providers from '@/components/Providers';
import Sidebar from '@/components/Sidebar';
import FAQSection from '@/components/footer/FAQ';
import ResponsiveDrawerInit from '@/components/ResponsiveDrawerInit';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import BrowserExtensionFix from '@/components/BrowserExtensionFix';
import ErrorBoundary from '@/components/ErrorBoundary';
import { constructMetadata, getOrganizationSchema } from '@/lib/seo';

const inter = Inter({ 
  subsets: ['latin'], 
  display: 'swap',
  variable: '--font-inter',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
});

const vietnam = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-vietnam',
});

export const metadata: Metadata = constructMetadata();

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const organizationSchema = getOrganizationSchema();
  
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${inter.className} ${jakarta.variable} ${vietnam.variable}`} suppressHydrationWarning>
        <BrowserExtensionFix />
        <Providers>
          <ErrorBoundary>
            <div className='drawer'>
              <DrawerButton />
              <ResponsiveDrawerInit />
              <div className='drawer-content'>
                <div className='flex min-h-screen flex-col'>
                  <Header />
                  {children}
                  <FAQSection />
                  <Footer />
                  <ScrollToTopButton />
                </div>
              </div>
              <div className='drawer-side'>
                <label
                  htmlFor='my-drawer'
                  aria-label='close sidebar'
                  className='drawer-overlay'
                ></label>
                <Sidebar />
              </div>
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
