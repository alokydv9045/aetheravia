import Link from 'next/link';

import Menu from './Menu';
import SearchInline from './SearchInline';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 text-gray-900">
      <nav aria-label="Main navigation" className="w-full">
        <div className='w-full flex items-center justify-between min-h-[5rem] px-4 sm:px-6 lg:px-8'>
          {/* Left: Logo */}
          <div className='flex items-center min-w-0'>
            <Link
              href='/'
              className='text-lg sm:text-2xl font-black tracking-tighter uppercase text-primary'
            >
              AETHRAVIA
            </Link>
          </div>
          
          {/* Center: Navigation Links (desktop) */}
          <div className='hidden lg:flex items-center space-x-4'>
            <Link href='/' className='text-base font-medium text-black hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-primary'>
              Home
            </Link>
            <Link href='/shop' className='text-base font-medium text-black hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-primary'>
              Shop
            </Link>
            <Link href='/about' className='text-base font-medium text-black hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-primary'>
              About
            </Link>
            <Link href='/ingredients' className='text-base font-medium text-black hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-primary'>
              Ingredients
            </Link>
            <Link href='/contact' className='text-base font-medium text-black hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-primary'>
              Contact
            </Link>
          </div>
          
          {/* Right: Search + Menu items */}
          <div className='flex items-center justify-end gap-1 sm:gap-2'>
            <SearchInline />
            <Menu showSearch={false} />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
