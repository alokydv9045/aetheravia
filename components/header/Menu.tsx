'use client';

import { ChevronDown, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { signOut, signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import useCartService from '@/lib/hooks/useCartStore';

const Menu = ({ showSearch = true }: { showSearch?: boolean }) => {
  const { items, init } = useCartService();
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const signOutHandler = () => {
    signOut({ callbackUrl: '/signin' });
    init();
  };

  const handleClick = () => {
    (document.activeElement as HTMLElement).blur();
  };

  // Force session refresh when status changes
  if (status === 'authenticated' && session) {
    // Session is ready, component will re-render automatically
  }

  return (
    <ul className='flex gap-2'>
      <li className='flex items-center gap-2 md:gap-4'>
        <Link
          href='/cart'
          className='relative mr-1 text-gray-700 hover:text-green-600 transition-colors'
          aria-label='Shopping Cart'
        >
          <ShoppingCart />
          <span className='absolute -right-4 -top-4'>
            {items.length !== 0 && (
              <div className='badge badge-primary px-1.5'>
                {items.reduce((a, c) => a + c.qty, 0)}
              </div>
            )}
          </span>
        </Link>
      </li>
      {session && session.user ? (
        <li>
          <div className='dropdown dropdown-end dropdown-bottom'>
            <label tabIndex={0} className='btn btn-ghost rounded-btn text-gray-700 hover:text-green-600'>
              {session.user.name}
              <ChevronDown />
            </label>
            <ul
              tabIndex={0}
              className='menu dropdown-content z-[1] w-52 rounded-box bg-white border border-gray-200 p-2 shadow-lg'
            >
              {session.user.isAdmin && (
                <li onClick={handleClick}>
                  <Link href='/admin/dashboard' className='text-gray-700 hover:text-green-600'>Admin Dashboard</Link>
                </li>
              )}

              <li onClick={handleClick}>
                <Link href='/order-history' className='text-gray-700 hover:text-green-600'>Order history</Link>
              </li>
              <li onClick={handleClick}>
                <Link href='/profile' className='text-gray-700 hover:text-green-600'>Profile</Link>
              </li>
              <li onClick={handleClick}>
                <button type='button' onClick={signOutHandler} className='text-gray-700 hover:text-green-600'>
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        </li>
      ) : (
        <li>
          <button
            className='btn btn-ghost rounded-btn text-gray-700 hover:text-green-600'
            type='button'
            onClick={() => signIn()}
          >
            Sign in
          </button>
        </li>
      )}
    </ul>
  );
};

export default Menu;
