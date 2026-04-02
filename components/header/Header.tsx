import { AlignJustify, Search } from 'lucide-react';
import Link from 'next/link';

import Menu from './Menu';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 text-gray-900">
      <nav aria-label="Main navigation" className="w-full">
        <div className='w-full flex items-center justify-between min-h-[5rem] px-4 sm:px-6 lg:px-8'>
          {/* Left: Drawer + Logo */}
          <div className='flex items-center min-w-0'>
            <label htmlFor='my-drawer' className='btn btn-square btn-ghost text-gray-700 hover:text-gray-900 hover:bg-gray-100 shrink-0' aria-label='Open menu'>
              <AlignJustify size={24} />
            </label>
            <Link
              href='/'
              className='ml-3 text-xl font-bold tracking-tight sm:ml-4 sm:text-2xl lg:text-3xl text-gray-900 truncate hover:text-green-600 transition-colors'
            >
              {process.env.NEXT_PUBLIC_BRAND_NAME || 'Aetheravia'}
            </Link>
          </div>
          
          {/* Center: Navigation Links (desktop) */}
          <div className='hidden lg:flex items-center space-x-8'>
            <Link href='/' className='text-lg font-medium text-gray-700 hover:text-green-600 transition-colors py-2 px-3 rounded-md hover:bg-green-50'>
              Home
            </Link>
            <Link href='/shop' className='text-lg font-medium text-gray-700 hover:text-green-600 transition-colors py-2 px-3 rounded-md hover:bg-green-50'>
              Shop
            </Link>
            <Link href='/about' className='text-lg font-medium text-gray-700 hover:text-green-600 transition-colors py-2 px-3 rounded-md hover:bg-green-50'>
              About
            </Link>
            <Link href='/ingredients' className='text-lg font-medium text-gray-700 hover:text-green-600 transition-colors py-2 px-3 rounded-md hover:bg-green-50'>
              Ingredients
            </Link>
            <Link href='/contact' className='text-lg font-medium text-gray-700 hover:text-green-600 transition-colors py-2 px-3 rounded-md hover:bg-green-50'>
              Contact
            </Link>
          </div>
          
          {/* Right: Search Icon + Menu items */}
          <div className='flex items-center justify-end gap-3 sm:gap-4'>
            <Link href='/search' className='text-gray-700 hover:text-green-600 transition-colors p-3 rounded-md hover:bg-green-50' aria-label='Search'>
              <Search size={22} />
            </Link>
            <Menu showSearch={false} />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
