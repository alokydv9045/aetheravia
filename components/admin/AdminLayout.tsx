"use client";

import Image from 'next/image';
import Link from 'next/link';
import { brandName } from '@/lib/brand';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AdminRealtimeListener from './AdminRealtimeListener';
import Menu from '@/components/header/Menu';

const AdminLayout = ({
  activeItem = 'dashboard',
  children,
}: {
  activeItem: string;
  children: React.ReactNode;
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const mobileToggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const desktopToggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Load admin sidebar preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('admin-sidebar-open');
      if (savedState !== null) {
        setSidebarOpen(JSON.parse(savedState));
      }
    }
  }, []);

  // Save admin sidebar preference to localStorage
  const toggleSidebar = useCallback((newState?: boolean) => {
    const nextState = newState !== undefined ? newState : !sidebarOpen;
    setSidebarOpen(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-sidebar-open', JSON.stringify(nextState));
    }
  }, [sidebarOpen]);

  // Track viewport to know when to apply mobile-specific behaviors
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const apply = (e: MediaQueryList | MediaQueryListEvent) => {
      const mobile = 'matches' in e ? e.matches : (e as MediaQueryList).matches;
      setIsMobile(mobile);
      
      // Improved mobile/desktop sidebar logic
      if (mobile) {
        // On mobile, always start with sidebar closed for better UX
        // Don't auto-close if user manually opened it
        const savedState = localStorage.getItem('admin-sidebar-open');
        if (savedState === null || savedState === 'true') {
          // Only close if it's the initial load or was open
          setSidebarOpen(false);
          localStorage.setItem('admin-sidebar-open', 'false');
        }
      } else {
        // On desktop, restore from localStorage or default to open
        const savedState = localStorage.getItem('admin-sidebar-open');
        const shouldBeOpen = savedState !== null ? JSON.parse(savedState) : true;
        setSidebarOpen(shouldBeOpen);
      }
    };
    apply(mq);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []); // Remove dependencies to prevent infinite loops

  const menuItems = useMemo(() => [
    {
      category: 'Main Portal',
      items: [
        { key: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
        { key: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: '📈' },
        { key: 'test-notifications', label: 'Test Notifications', href: '/admin/test-notifications', icon: '🔔' }
      ]
    },
    {
      category: 'Commerce Hub',
      items: [
        { key: 'orders-advanced', label: 'Advanced Orders', href: '/admin/orders/advanced', icon: '🔍' },
        { key: 'orders-unified', label: 'Unified Orders', href: '/admin/orders/unified', icon: '🎯' },
        { key: 'products', label: 'Products', href: '/admin/products', icon: '🛍️' }
      ]
    },
    {
      category: 'Marketing Center',
      items: [
        { key: 'offers', label: 'Offers', href: '/admin/offers', icon: '🎯' },
        { key: 'coupons', label: 'Coupons', href: '/admin/coupons', icon: '🎫' },
        { key: 'carousel', label: 'Banners', href: '/admin/carousel', icon: '🖼️' }
      ]
    },
    {
      category: 'Customer Vault',
      items: [
        { key: 'users', label: 'Users', href: '/admin/users', icon: '👥' },
        { key: 'loyalty', label: 'Loyalty', href: '/admin/loyalty', icon: '⭐' },
        { key: 'referral', label: 'Referral', href: '/admin/referral', icon: '🔗' },
        { key: 'personalization', label: 'Personalization', href: '/admin/personalization', icon: '🎨' }
      ]
    },
    {
      category: 'Editorial',
      items: [
        { key: 'testimonials', label: 'Testimonials', href: '/admin/testimonials', icon: '💬' }
      ]
    }
  ], []);

  // Initialize collapsed state (collapsed by default on mobile except first section)
  useEffect(() => {
    if (menuItems.length && isMobile) {
      setCollapsed(menuItems.reduce<Record<string, boolean>>((acc, cat, idx) => {
        acc[cat.category] = idx !== 0; // collapse all but first
        return acc;
      }, {}));
    } else if (!isMobile) {
      // expand all on desktop
      setCollapsed({});
    }
  }, [isMobile, menuItems]);

  const toggleCategory = useCallback((category: string) => {
    setCollapsed(c => ({ ...c, [category]: !c[category] }));
  }, []);

  // Focus trap & accessibility when sidebar open + mobile touch handling
  useEffect(() => {
    if (sidebarOpen) {
      const previouslyFocused = document.activeElement as HTMLElement | null;
      const sidebarElement = sidebarRef.current; // Capture ref value
      
      // Focus first link when sidebar opens
      setTimeout(() => {
        firstLinkRef.current?.focus();
      }, 100);

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          toggleSidebar(false);
          // Focus appropriate toggle button based on screen size
          if (isMobile) {
            mobileToggleButtonRef.current?.focus();
          } else {
            desktopToggleButtonRef.current?.focus();
          }
        } else if (e.key === 'Tab' && sidebarElement) {
          const focusable = sidebarElement.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
        }
      };

      // Mobile swipe gesture to close sidebar
      let startX = 0;
      let startY = 0;
      const handleTouchStart = (e: TouchEvent) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (!isMobile || !sidebarElement) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = startX - currentX;
        const diffY = Math.abs(startY - currentY);
        
        // If swipe left is significant and more horizontal than vertical
        if (diffX > 50 && diffY < 100) {
          e.preventDefault(); // Only prevent default when we're actually handling the swipe
          toggleSidebar(false);
        }
      };

      document.addEventListener('keydown', handleKey);
      if (isMobile && sidebarElement) {
        sidebarElement.addEventListener('touchstart', handleTouchStart, { passive: true });
        sidebarElement.addEventListener('touchmove', handleTouchMove, { passive: false }); // Allow preventDefault
      }
      
      return () => {
        document.removeEventListener('keydown', handleKey);
        if (sidebarElement) {
          sidebarElement.removeEventListener('touchstart', handleTouchStart);
          sidebarElement.removeEventListener('touchmove', handleTouchMove);
        }
      };
    }
  }, [sidebarOpen, isMobile, toggleSidebar]);

  return (
    <div className='relative flex min-h-screen bg-stone-50 text-gray-900 font-body'>
      {/* Sidebar - Unified Glass Branding */}
      <div
        id="admin-mobile-sidebar"
        ref={sidebarRef}
        aria-hidden={!sidebarOpen}
        className={`
        fixed inset-y-0 left-0 z-40 w-80 max-w-[85%] bg-white/95 backdrop-blur-xl border-r border-gray-100 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col outline-none
        md:relative md:block md:shadow-none md:max-w-none md:w-72
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
        role={isMobile ? 'dialog' : 'navigation'}
        aria-label="Admin navigation"
        aria-modal={isMobile ? true : undefined}
      >
        {/* Sidebar Header: Official Brand Logo & Type */}
        <div className="p-6 border-b border-gray-50 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
              <Image src="/images/logo_mark.png" alt="Aetheravia" fill className="object-contain" priority />
            </div>
            <div>
              <h1 className="font-headline font-black text-sm tracking-tighter text-primary uppercase leading-tight">AETHRAVIA</h1>
              <p className="text-[10px] font-label font-bold text-gray-300 uppercase tracking-[0.3em]">Guardian Hub</p>
            </div>
          </Link>
        </div>

        {/* Navigation Menu: Brand Interactions */}
        <div className="p-4 space-y-6 flex-1 flex flex-col overflow-y-auto">
          {menuItems.map((category, categoryIndex) => {
            const isCollapsed = collapsed[category.category];
            return (
              <div key={categoryIndex} className="flex-shrink-0">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-1 rounded-md md:cursor-default group mb-1"
                  aria-expanded={isCollapsed ? 'false' : 'true'}
                  onClick={() => isMobile && toggleCategory(category.category)}
                >
                  <span className="text-[10px] font-label font-bold text-gray-300 uppercase tracking-[0.2em]">{category.category}</span>
                  {isMobile && (
                    <span className={`transition-all text-gray-300 group-hover:text-primary ${isCollapsed ? '' : 'rotate-90'}`}>▶</span>
                  )}
                </button>
                <ul className={`space-y-1 mt-1 transition-[max-height,opacity] duration-300 ease-out ${isCollapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-96 opacity-100'}`}>
                  {category.items.map((item, itemIdx) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        ref={categoryIndex === 0 && itemIdx === 0 ? firstLinkRef : undefined}
                        className={`
                          flex items-center px-4 py-2.5 rounded-xl transition-all duration-300 group
                          ${activeItem === item.key 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold' 
                            : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                          }
                        `}
                        onClick={() => isMobile && toggleSidebar(false)}
                      >
                         <span className={`mr-3 text-lg transition-transform group-hover:scale-125 ${activeItem === item.key ? 'scale-110' : 'opacity-70'}`}>{item.icon}</span>
                        <span className="text-sm tracking-tight">{item.label}</span>
                        {activeItem === item.key && (
                          <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-gray-50 flex-shrink-0">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-label font-bold text-green-700 uppercase tracking-tight">System Secure</span>
            </div>
            <p className="text-[10px] font-label font-bold text-gray-300 uppercase tracking-widest text-center">
              v2.8 Artisan Edition
            </p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-primary/10 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => toggleSidebar(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300">
        {/* Top Header Row (The Vault Header) */}
        <header className="sticky top-0 z-30 h-16 bg-white/70 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* The 3-line Toggle (Hamburger) integrated into Navbar */}
            <button
              onClick={() => toggleSidebar()}
              className="p-2.5 rounded-xl transition-all hover:bg-primary/5 active:scale-90 text-primary group"
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <div className="relative w-6 h-5 overflow-hidden">
                <span className={`absolute h-0.5 w-6 bg-current rounded-full transition-all duration-300 ${sidebarOpen ? 'top-2.5 -rotate-45' : 'top-0'}`} />
                <span className={`absolute h-0.5 w-4 bg-current rounded-full transition-all duration-300 top-2 ${sidebarOpen ? 'opacity-0 translate-x-10' : 'opacity-100'}`} />
                <span className={`absolute h-0.5 w-6 bg-current rounded-full transition-all duration-300 ${sidebarOpen ? 'top-2.5 rotate-45' : 'top-4'}`} />
              </div>
            </button>
            <div className="h-6 w-[1px] bg-gray-100 mx-1"></div>
            <div className="hidden sm:block">
               <span className="text-[10px] font-label font-bold text-gray-300 uppercase tracking-[0.25em]">Aetheravia Console</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <Link href="/" className="hidden lg:flex items-center gap-2 text-[10px] font-label font-bold text-primary/60 uppercase tracking-widest hover:text-primary transition-colors hover:underline whitespace-nowrap">
              <span>Exit to Boutique</span>
              <span className="text-xs">↗</span>
            </Link>
            <div className="hidden lg:block h-6 w-[1px] bg-gray-100"></div>
            {/* The Actual Profile Dropdown (Themed Primary) */}
            <Menu showSearch={false} />
          </div>
        </header>

        <main className="flex-1 relative overflow-y-auto overflow-x-hidden p-4 sm:p-8 lg:p-10 scroll-smooth">
          {/* Subtle branding background element */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative max-w-[1600px] mx-auto w-full pb-20">
            {children}
          </div>
        </main>
      </div>
      <AdminRealtimeListener />
    </div>
  );
};

export default AdminLayout;
