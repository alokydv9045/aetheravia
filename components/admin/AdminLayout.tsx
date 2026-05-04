"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useSelectedLayoutSegment, useRouter } from 'next/navigation';
import AdminRealtimeListener from './AdminRealtimeListener';
import Menu from '@/components/header/Menu';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = ({
  activeItem = 'dashboard',
  children,
}: {
  activeItem: string;
  children: React.ReactNode;
}) => {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navSections = [
    {
      title: 'Main Portal',
      items: [
        { key: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
        { key: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: 'insights' },
        { key: 'test-notifications', label: 'Notifications', href: '/admin/test-notifications', icon: 'notifications' },
      ]
    },
    {
      title: 'Commerce Hub',
      items: [
        { key: 'orders-advanced', label: 'Advanced Orders', href: '/admin/orders/advanced', icon: 'assignment' },
        { key: 'orders-unified', label: 'Unified Orders', href: '/admin/orders/unified', icon: 'shopping_cart' },
        { key: 'products', label: 'Products', href: '/admin/products', icon: 'spa' },
      ]
    },
    {
      title: 'Marketing Center',
      items: [
        { key: 'offers', label: 'Offers', href: '/admin/offers', icon: 'local_offer' },
        { key: 'coupons', label: 'Coupons', href: '/admin/coupons', icon: 'confirmation_number' },
        { key: 'carousel', label: 'Banners', href: '/admin/carousel', icon: 'image' },
      ]
    },
    {
      title: 'Customer Vault',
      items: [
        { key: 'users', label: 'Users', href: '/admin/users', icon: 'group' },
        { key: 'loyalty', label: 'Loyalty', href: '/admin/loyalty', icon: 'workspace_premium' },
        { key: 'referral', label: 'Referral', href: '/admin/referral', icon: 'share' },
        { key: 'personalization', label: 'Personalization', href: '/admin/personalization', icon: 'palette' },
      ]
    },
    {
      title: 'Editorial',
      items: [
        { key: 'testimonials', label: 'Testimonials', href: '/admin/testimonials', icon: 'chat' },
      ]
    }
  ];

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen relative font-body selection:bg-primary/10 selection:text-primary">
      {/* Tactile Depth Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-noise z-50 opacity-[0.03]"></div>

      {/* SideNavBar */}
      <aside className={`h-screen w-72 flex-col fixed left-0 top-0 bg-surface border-r border-outline-variant/20 z-40 transition-transform duration-500 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 h-full flex flex-col overflow-y-auto scrollbar-hide">
          <div className="flex items-center gap-3 mb-12 flex-shrink-0">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-on-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
            </div>
            <div>
              <h1 className="text-[13px] font-black font-headline text-primary uppercase leading-tight tracking-tighter">AETHRAVIA</h1>
              <p className="text-[9px] uppercase font-bold tracking-[0.3em] text-on-surface-variant/40 mt-0.5">GUARDIAN HUB</p>
            </div>
          </div>

          <nav className="space-y-8 flex-1">
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/30 mb-4 px-5">{section.title}</p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = activeItem === item.key;
                    return (
                      <Link 
                        key={item.key} 
                        href={item.href}
                        className={`flex items-center gap-4 py-2.5 px-5 rounded-xl transition-all duration-300 group ${
                          isActive 
                            ? 'text-primary font-bold bg-primary/5 border-l-4 border-primary' 
                            : 'text-secondary hover:text-primary hover:bg-surface-container-low border-l-4 border-transparent'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-lg ${isActive ? 'text-primary' : 'text-secondary/60 group-hover:text-primary'}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>
                          {item.icon}
                        </span>
                        <span className="font-label text-[12px] tracking-tight uppercase font-bold">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-12 pt-8 border-t border-outline-variant/10 flex-shrink-0">
            <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant/10 mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 mb-2">System Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <p className="text-xs font-bold text-on-surface">Connected</p>
              </div>
            </div>
            <Link href="/admin/products/new">
              <button className="w-full bg-primary text-on-primary py-4 px-6 rounded-xl font-label font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">add</span>
                Add New Product
              </button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`transition-all duration-500 ease-in-out ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        {/* TopNavBar */}
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl flex justify-between items-center w-full px-8 lg:px-12 py-5 border-b border-outline-variant/10">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-surface-container rounded-lg transition-colors lg:hidden"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h2 className="text-xl font-headline italic text-on-surface font-bold capitalize">{activeItem.replace('-', ' ')}</h2>
            </div>
            <nav className="hidden md:flex gap-10 items-center">
              <a className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary border-b-2 border-primary pb-1" href="#">Overview</a>
              <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary hover:text-primary transition-all opacity-40 hover:opacity-100">Exit to Store</Link>
            </nav>
          </div>

          <div className="flex items-center gap-5 lg:gap-8">
            <div className="relative group hidden sm:block">
              <span className="material-symbols-outlined text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all">search</span>
              <input 
                className="bg-surface-container-low border border-outline-variant/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-full py-2.5 pl-12 pr-6 text-xs w-56 lg:w-80 placeholder:text-on-surface-variant/30 transition-all outline-none font-body" 
                placeholder="Search products..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
            
            <div className="h-8 w-[1px] bg-outline-variant/20 mx-2 hidden lg:block"></div>
            
            <button className="flex items-center gap-3 group pl-2 py-1 pr-1 hover:bg-surface-container rounded-full transition-all">
              <div className="w-9 h-9 rounded-full bg-secondary-container p-0.5 border border-primary/10 shadow-sm ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                {session && (session.user as any)?.avatar ? (
                  <img src={(session.user as any).avatar} className="w-full h-full object-cover rounded-full" alt="Admin" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-on-primary rounded-full font-headline italic text-xs font-bold">
                    {session?.user?.name?.[0] || 'A'}
                  </div>
                )}
              </div>
              <div className="text-left hidden lg:block pr-3">
                <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface leading-none">{session?.user?.name || 'Admin Profile'}</span>
                <span className="text-[9px] text-primary/60 font-bold uppercase tracking-widest leading-none mt-1 block">Sentinel</span>
              </div>
            </button>
          </div>
        </header>

        {/* Content Canvas */}
        <section className="p-8 lg:p-12 relative">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            {children}
          </div>
        </section>

        {/* Footer Info */}
        <footer className="px-12 py-12 text-center border-t border-outline-variant/10 bg-surface-container-low/30">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 opacity-30 grayscale">
              <Image src="/images/logo_mark.png" alt="Aetheravia" width={24} height={24} />
              <span className="font-headline font-bold text-xs uppercase tracking-widest">AETHERAVIA</span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-on-surface-variant/40">
              © 2024 Aetheravia Heritage Archive. Operational Integrity Secured.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors">Documentation</a>
              <a href="#" className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </main>
      <AdminRealtimeListener />
    </div>
  );
};

export default AdminLayout;
