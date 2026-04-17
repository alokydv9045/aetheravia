'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { Home, ShoppingBag, Info, TestTube, Phone, User, ShoppingCart, LogIn, UserPlus, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';

import useLayoutService from '@/lib/hooks/useLayout';

const Sidebar = () => {
  const { toggleDrawer } = useLayoutService();
  const { data: session, status } = useSession();
  const {
    data: categories,
    error,
    isLoading,
  } = useSWR('/api/products/categories');

  if (error) return error.message;
  if (isLoading || !categories) return 'Loading...';

  return (
    <ul className='menu min-h-full w-80 bg-white p-4 text-gray-700'>
      {/* Main Navigation - Hidden on Desktop */}
      <li className='lg:hidden'>
        <h2 className='text-xl font-bold text-gray-900 mb-4'>Navigation</h2>
      </li>
      <li className='lg:hidden'>
        <Link href='/' onClick={toggleDrawer} className='flex items-center gap-3 text-black hover:text-primary font-medium'>
          <Home size={20} />
          Home
        </Link>
      </li>
      <li className='lg:hidden'>
        <Link href='/shop' onClick={toggleDrawer} className='flex items-center gap-3 text-black hover:text-primary font-medium'>
          <ShoppingBag size={20} />
          Shop
        </Link>
      </li>
      <li className='lg:hidden'>
        <Link href='/search' onClick={toggleDrawer} className='flex items-center gap-3 text-black hover:text-primary font-medium'>
          <Search size={20} />
          Search
        </Link>
      </li>
      <li className='lg:hidden'>
        <Link href='/about' onClick={toggleDrawer} className='flex items-center gap-3 text-black hover:text-primary font-medium'>
          <Info size={20} />
          About
        </Link>
      </li>

      <li className='lg:hidden'>
        <Link href='/ritual' onClick={toggleDrawer} className='flex items-center gap-3 text-black hover:text-primary font-medium'>
          <TestTube size={20} />
          Rituals
        </Link>
      </li>
      <li className='lg:hidden'>
        <Link href='/ingredients' onClick={toggleDrawer} className='flex items-center gap-3 text-black hover:text-primary font-medium'>
          <TestTube size={20} />
          Ingredients
        </Link>
      </li>
      <li className='lg:hidden'>
        <Link href='/contact' onClick={toggleDrawer} className='flex items-center gap-3 text-black hover:text-primary font-medium'>
          <Phone size={20} />
          Contact
        </Link>
      </li>
      <li className='lg:hidden'>
        <Link href='/cart' onClick={toggleDrawer} className='flex items-center gap-3 text-gray-700 hover:text-green-600'>
          <ShoppingCart size={20} />
          Cart
        </Link>
      </li>
      
      {/* Authentication-based navigation - Hidden on Desktop */}
      {status === 'authenticated' && session?.user ? (
        <>
          <li className='lg:hidden'>
            <Link href='/profile' onClick={toggleDrawer} className='flex items-center gap-3 text-gray-700 hover:text-green-600'>
              <User size={20} />
              Profile
            </Link>
          </li>
          <li className='lg:hidden'>
            <Link href='/order-history' onClick={toggleDrawer} className='flex items-center gap-3 text-gray-700 hover:text-green-600'>
              <ShoppingBag size={20} />
              Order History
            </Link>
          </li>
          {session.user.isAdmin && (
            <li className='lg:hidden'>
              <Link href='/admin/dashboard' onClick={toggleDrawer} className='flex items-center gap-3 text-blue-600 hover:text-blue-700'>
                <User size={20} />
                Admin Dashboard
              </Link>
            </li>
          )}
        </>
      ) : (
        <>
          <li className='lg:hidden'>
            <Link href='/signin' onClick={toggleDrawer} className='flex items-center gap-3 text-gray-700 hover:text-green-600'>
              <LogIn size={20} />
              Sign In
            </Link>
          </li>
          <li className='lg:hidden'>
            <Link href='/register' onClick={toggleDrawer} className='flex items-center gap-3 text-gray-700 hover:text-green-600'>
              <UserPlus size={20} />
              Register
            </Link>
          </li>
        </>
      )}
      
      <div className='divider'></div>
      
      {/* Shop Categories */}
      <li>
        <h2 className='text-lg font-semibold text-gray-900 mb-2'>Shop by Category</h2>
      </li>
      {categories.map((category: string) => (
        <li key={category}>
          <Link href={`/search?category=${category}`} onClick={toggleDrawer} className='text-gray-600 hover:text-green-600 pl-4'>
            {category}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default Sidebar;
