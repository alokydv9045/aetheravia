'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { 
  Home, 
  ShoppingBag, 
  Info, 
  Sparkles, 
  Phone, 
  User, 
  ShoppingCart, 
  LogIn, 
  UserPlus, 
  Search,
  ChevronRight,
  Leaf,
  History,
  LayoutDashboard,
  LogOut,
  X
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

import useLayoutService from '@/lib/hooks/useLayout';
import useCartService from '@/lib/hooks/useCartStore';

const Sidebar = () => {
  const { toggleDrawer, drawerOpen } = useLayoutService();
  const { data: session, status } = useSession();
  const { init: initCart } = useCartService();
  
  const logoutHandler = () => {
    signOut({ callbackUrl: '/signin' });
    initCart();
    toggleDrawer();
  };

  const {
    data: categories,
    error,
    isLoading,
  } = useSWR('/api/products/categories');

  if (error) return <div className="p-8 text-center text-red-500">Error loading categories</div>;
  
  const NavLink = ({ href, icon: Icon, children, isPrimary = false }: any) => (
    <Link 
      href={href} 
      onClick={toggleDrawer}
      className={`flex items-center justify-between group py-3 px-4 rounded-xl transition-all duration-300 ${
        isPrimary 
          ? 'bg-primary/5 text-primary hover:bg-primary hover:text-white shadow-sm' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-4">
        <Icon size={isPrimary ? 22 : 20} className={isPrimary ? '' : 'text-gray-400 group-hover:text-primary transition-colors'} />
        <span className={`text-base tracking-tight font-medium ${isPrimary ? 'font-bold' : ''}`}>
          {children}
        </span>
      </div>
      <ChevronRight size={16} className="opacity-0 group-hover:opacity-40 transition-opacity" />
    </Link>
  );

  const SectionHeader = ({ children }: { children: React.ReactNode }) => (
    <h3 className="px-4 text-[10px] font-bold text-primary/40 uppercase tracking-[0.3em] mb-2 mt-8">
      {children}
    </h3>
  );

  return (
    <div className="flex flex-col h-full bg-white max-w-[320px] shadow-2xl overflow-hidden">
      {/* Drawer Header */}
      <div className="px-6 pt-10 pb-6 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles size={18} />
          </div>
          <span className="hidden text-xl font-black tracking-tighter uppercase text-primary">
            AETHRAVIA
          </span>
        </div>
        <button 
          onClick={toggleDrawer}
          className="p-2 -mr-2 rounded-full hover:bg-gray-50 transition-colors text-gray-400"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        {/* Primary Site Navigation */}
        <SectionHeader>Ritual Navigation</SectionHeader>
        <div className="space-y-1">
          <NavLink href="/" icon={Home} isPrimary>Home</NavLink>
          <NavLink href="/shop" icon={ShoppingBag}>Shop</NavLink>
          <NavLink href="/ritual" icon={Sparkles}>Our Rituals</NavLink>
          <NavLink href="/ingredients" icon={Leaf}>Earthly Elements</NavLink>
        </div>

        {/* Discovery & Heritage */}
        <SectionHeader>The Heritage</SectionHeader>
        <div className="space-y-1">
          <NavLink href="/about" icon={Info}>Our Journey</NavLink>
          <NavLink href="/contact" icon={Phone}>Consultations</NavLink>
        </div>

        {/* Categories Section */}
        <SectionHeader>Collections</SectionHeader>
        <div className="grid grid-cols-1 gap-1">
          {!isLoading && categories?.map((category: string) => (
            <Link 
              key={category} 
              href={`/shop?category=${encodeURIComponent(category)}`} 
              onClick={toggleDrawer}
              className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-primary hover:bg-primary/5 transition-all group"
            >
              <span>{category}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
          {isLoading && <div className="px-4 py-2 text-xs text-gray-400 animate-pulse">Sourcing collections...</div>}
        </div>

        {/* Your Archive (Accounts) */}
        <SectionHeader>Your Archive</SectionHeader>
        <div className="space-y-1 pb-4">
          {status === 'authenticated' && session?.user ? (
            <>
              <NavLink href="/profile" icon={User}>Account Profile</NavLink>
              <NavLink href="/order-history" icon={History}>Trove History</NavLink>
              {session.user.isAdmin && (
                <NavLink href="/admin/dashboard" icon={LayoutDashboard}>Admin Dashboard</NavLink>
              )}
              <button 
                onClick={logoutHandler}
                className="w-full flex items-center justify-between group py-3 px-4 rounded-xl transition-all duration-300 text-red-600 hover:bg-red-50 mt-4"
              >
                <div className="flex items-center gap-4">
                  <LogOut size={20} className="text-red-400 group-hover:text-red-600 transition-colors" />
                  <span className="text-base tracking-tight font-medium">Sign Out</span>
                </div>
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-40 transition-opacity" />
              </button>
            </>
          ) : (
            <>
              <NavLink href="/signin" icon={LogIn}>Access Account</NavLink>
              <NavLink href="/register" icon={UserPlus}>Join the Heritage</NavLink>
            </>
          )}
        </div>
      </div>

      {/* Footer / Logout */}
      {status === 'authenticated' && (
        <div className="p-4 border-t border-gray-50 mb-6 px-4">
          <p className="text-[10px] text-center text-gray-400 font-bold mb-4 uppercase tracking-widest">
            Logged in as {session?.user?.name}
          </p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
