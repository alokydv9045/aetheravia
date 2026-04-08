import React from 'react';

interface TripCarouselProps {
  children: React.ReactNode;
}

const TripCarousel: React.FC<TripCarouselProps> = ({ children }) => {
  return (
    <div 
      className="flex gap-5 overflow-x-auto pb-4 scroll-smooth scrollbar-hide" 
      style={{ 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none', 
        WebkitOverflowScrolling: 'touch' 
      }}
    >
      {children}
    </div>
  );
};

export default TripCarousel;
