"use client";
import { useEffect, useState, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * Floating scroll-to-top button.
 * - Appears after user scrolls 400px
 * - Smoothly scrolls to top
 * - Accessible (aria-label + keyboard support)
 */
const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  const onScroll = useCallback(() => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (y > 400) {
      if (!visible) setVisible(true);
    } else if (visible) {
      setVisible(false);
    }
  }, [visible]);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed z-50 bottom-6 right-6 btn btn-circle btn-primary shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-4'}`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

export default ScrollToTopButton;
