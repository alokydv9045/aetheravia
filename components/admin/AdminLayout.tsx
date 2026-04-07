"use client";

import Link from 'next/link';
import { brandName } from '@/lib/brand';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AdminRealtimeListener from './AdminRealtimeListener';

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
      category: 'Overview',
      items: [
        { key: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
        { key: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: '📈' },
        { key: 'test-notifications', label: 'Test Notifications', href: '/admin/test-notifications', icon: '🔔' }
      ]
    },
    {
      category: 'Commerce',
      items: [
        { key: 'orders-advanced', label: 'Advanced Orders', href: '/admin/orders/advanced', icon: '🔍' },
        { key: 'orders-unified', label: 'Unified Orders', href: '/admin/orders/unified', icon: '🎯' },
        { key: 'products', label: 'Products', href: '/admin/products', icon: '🛍️' }
      ]
    },
    {
      category: 'Marketing',
      items: [
        { key: 'offers', label: 'Offers', href: '/admin/offers', icon: '🎯' },
        { key: 'coupons', label: 'Coupons', href: '/admin/coupons', icon: '🎫' },
        { key: 'carousel', label: 'Banners', href: '/admin/carousel', icon: '🖼️' }
      ]
    },
    {
      category: 'Customer',
      items: [
        { key: 'users', label: 'Users', href: '/admin/users', icon: '👥' },
        { key: 'loyalty', label: 'Loyalty', href: '/admin/loyalty', icon: '⭐' },
        { key: 'referral', label: 'Referral', href: '/admin/referral', icon: '🔗' },
        { key: 'personalization', label: 'Personalization', href: '/admin/personalization', icon: '🎨' }
      ]
    },
    {
      category: 'Content',
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
  <div className='admin-neutral relative flex min-h-screen bg-base-100 text-base-content'>
      {/* Mobile menu button - improved positioning and visibility */}
      <button
        ref={mobileToggleButtonRef}
        onClick={() => toggleSidebar()}
        className="fixed top-4 left-4 z-50 p-3 rounded-lg bg-primary text-primary-content shadow-lg hover:bg-primary/90 transition-all duration-200 md:hidden"
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={sidebarOpen}
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop toggle button - improved styling */}
      <button
        ref={desktopToggleButtonRef}
        onClick={() => toggleSidebar()}
        className="hidden md:block fixed top-4 left-4 z-50 p-2 rounded-lg bg-base-200 shadow-lg hover:bg-base-300 transition-colors"
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={sidebarOpen}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar - improved mobile handling */}
      <div
        id="admin-mobile-sidebar"
        ref={sidebarRef}
        aria-hidden={!sidebarOpen}
        className={`
        fixed inset-y-0 left-0 z-40 w-80 max-w-[85%] bg-gradient-to-b from-base-200 to-base-300 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col outline-none
        md:relative md:block md:shadow-lg md:max-w-none md:w-72
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          // Ensure proper touch handling on mobile
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
        role={isMobile ? 'dialog' : 'navigation'}
        aria-label="Admin navigation"
        aria-modal={isMobile ? true : undefined}
      >
        {/* Close button removed with toggle icon */}
        {/* Sidebar Header */}
        <div className="p-4 border-b border-base-content/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-200 border border-gray-300 shadow-sm">
              <span className="font-bold text-sm text-base-content">V</span>
            </div>
            <div>
              <h1 className="font-bold text-base text-base-content">{brandName}</h1>
              <p className="text-xs text-base-content/70">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="p-4 space-y-4 flex-1 flex flex-col overflow-y-auto">
          {menuItems.map((category, categoryIndex) => {
            const isCollapsed = collapsed[category.category];
            return (
              <div key={categoryIndex} className="flex-shrink-0">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-base-100 md:cursor-default group"
                  aria-expanded={isCollapsed ? 'false' : 'true'}
                  onClick={() => isMobile && toggleCategory(category.category)}
                >
                  <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">{category.category}</span>
                  {isMobile && (
                    <span className={`transition-transform text-base-content/60 group-hover:text-base-content ${isCollapsed ? '' : 'rotate-90'}`}>▶</span>
                  )}
                </button>
                <ul className={`space-y-1 mt-1 transition-[max-height,opacity] duration-300 ease-out ${isCollapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-96 opacity-100'}`}>
                  {category.items.map((item, itemIdx) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        ref={categoryIndex === 0 && itemIdx === 0 ? firstLinkRef : undefined}
                        className={`
                          flex items-center px-3 py-2 rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary/40
                          ${activeItem === item.key 
                            ? 'bg-gray-200 text-base-content shadow-inner font-medium' 
                            : 'text-base-content hover:bg-base-100 hover:shadow-sm active:bg-gray-200'
                          }
                        `}
                        onClick={() => isMobile && toggleSidebar(false)}
                      >
                        <span className="font-medium text-sm truncate">{item.label}</span>
                        {activeItem === item.key && (
                          <span className="ml-auto w-2 h-2 bg-primary-content rounded-full animate-ping"></span>
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
        <div className="p-3 border-t border-base-content/10 flex-shrink-0">
          <div className="text-center">
            <p className="text-xs text-base-content/50">{brandName} Admin v2.0</p>
            <div className="flex justify-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
              <span className="text-xs text-success">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open - improved touch handling */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={() => toggleSidebar(false)}
          aria-hidden="true"
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'none'
          }}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen && !isMobile ? 'md:ml-0' : ''}`}>
        <div className={`min-h-screen bg-gradient-to-br from-base-100 to-base-200 ${!isMobile ? 'pt-16' : 'pt-16'}`}>
          {children}
        </div>
      </div>
      {/* Realtime listener (non-intrusive) */}
      <AdminRealtimeListener />
    </div>
  );
};

export default AdminLayout;
