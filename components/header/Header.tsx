'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import Menu from './Menu';
import SearchInline from './SearchInline';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-md shadow-sm' 
        : 'bg-white'
    } border-b border-gray-100 text-gray-900`}>
      <nav aria-label="Main navigation" className="w-full">
        <div className='container mx-auto px-4 flex items-center justify-between min-h-[3rem] md:min-h-[3.5rem]'>
          {/* Left: Logo */}
          <div className='flex items-center min-w-0'>
            <Link
              href='/'
              className='flex items-center gap-2 group'
            >
              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                <Image
                  src="/images/logo_mark.png"
                  alt="Aetheravia Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className='text-lg sm:text-2xl font-black tracking-tighter uppercase text-primary hover:opacity-80 transition-opacity'>
                AETHRAVIA
              </span>
            </Link>
          </div>
          
          {/* Center: Navigation Links (desktop) */}
          <div className='hidden lg:flex items-center space-x-2'>
            <Link href='/' className='text-sm font-bold text-black hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-primary'>
              Home
            </Link>
            <Link href='/shop' className='text-sm font-bold text-black hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-primary'>
              Shop
            </Link>
            <Link href='/about' className='text-sm font-bold text-black hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-primary'>
              About
            </Link>
            <Link href='/ingredients' className='text-sm font-bold text-black hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-primary'>
              Ingredients
            </Link>
            <Link href='/contact' className='text-sm font-bold text-black hover:text-white transition-all duration-300 py-2 px-5 rounded-full hover:bg-primary'>
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
