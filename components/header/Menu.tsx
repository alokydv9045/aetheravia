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
      <li className='flex items-center'>
        <Link
          href='/cart'
          className='flex items-center gap-2 text-base font-medium text-black hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-primary group relative'
          aria-label='Shopping Cart'
        >
          <ShoppingCart size={20} className="transition-colors group-hover:text-white" />
          <span className="hidden sm:inline">Cart</span>
          {items.length !== 0 && (
            <span className='absolute top-0 right-2 -mt-2 -mr-1'>
              <div className='badge badge-primary badge-sm h-4 w-4 p-0 flex items-center justify-center text-[10px]'>
                {items.reduce((a, c) => a + c.qty, 0)}
              </div>
            </span>
          )}
        </Link>
      </li>
      {session && session.user ? (
        <li>
          <div className='dropdown dropdown-end dropdown-bottom'>
            <label tabIndex={0} className='flex items-center gap-2 text-base font-medium text-black hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-primary cursor-pointer'>
              {session.user.name}
              <ChevronDown size={16} />
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
            className='text-base font-medium text-black hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-primary'
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
