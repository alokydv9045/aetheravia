'use client';

import React from 'react';
import { Leaf, Heart, Award, CheckCircle } from 'lucide-react';

const TrustBar = () => {
  const trustItems = [
    { icon: Leaf, text: '100% Natural' },
    { icon: Heart, text: 'Cruelty Free' },
    { icon: Award, text: 'Dermatologist Tested' },
    { icon: CheckCircle, text: 'Vegan Certified' }
  ];

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-10 text-base md:text-lg">
          {trustItems.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 cursor-default hover:bg-[#2D4B3C] hover:text-white text-[#2D4B3C] group"
            >
              <item.icon className="h-6 w-6 transition-colors group-hover:text-white" />
              <span className="font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustBar;
