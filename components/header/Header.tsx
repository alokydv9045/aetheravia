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
              className='ml-3 text-lg sm:text-2xl font-black tracking-tighter uppercase transition-colors text-[#2D4B3C]'
            >
              AETHRAVIA
            </Link>
          </div>
          
          {/* Center: Navigation Links (desktop) */}
          <div className='hidden lg:flex items-center space-x-4'>
            <Link href='/' className='text-base font-medium text-[#2D4B3C] hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-[#2D4B3C]'>
              Home
            </Link>
            <Link href='/shop' className='text-base font-medium text-[#2D4B3C] hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-[#2D4B3C]'>
              Products
            </Link>
            <Link href='/about' className='text-base font-medium text-[#2D4B3C] hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-[#2D4B3C]'>
              About us
            </Link>
            <Link href='/ingredients' className='text-base font-medium text-[#2D4B3C] hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-[#2D4B3C]'>
              Ingredients
            </Link>
            <Link href='/contact' className='text-base font-medium text-[#2D4B3C] hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-[#2D4B3C]'>
              Contact us
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
