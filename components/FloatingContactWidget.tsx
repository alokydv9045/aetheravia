"use client";

import React, { useState } from 'react';
import { MessageCircle, Phone, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supportPhone } from '@/lib/brand';

/**
 * Premium Floating Contact Widget
 * Includes WhatsApp and Phone support buttons with smooth animations.
 * Positioned to coexist with ScrollToTopButton.
 */
const FloatingContactWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Clean the phone number for URLs
  const phoneNumber = supportPhone.replace(/[^0-9+]/g, '');
  
  // WhatsApp usually prefers numbers without + for the wa.me link in some contexts, 
  // but wa.me/number works fine with international format.
  const whatsappNumber = phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello! I have a query regarding Aetheravia products.`;
  const telUrl = `tel:${phoneNumber}`;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.8, y: 20, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="flex flex-col gap-4 mb-4 pointer-events-auto"
          >
            {/* WhatsApp Button */}
            <motion.a
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 bg-white/90 backdrop-blur-md hover:bg-white px-5 py-4 rounded-3xl shadow-[0_20px_50px_rgba(34,197,94,0.2)] border border-green-100 transition-all duration-300"
            >
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-green-600 tracking-widest opacity-70">WhatsApp</span>
                <span className="text-base font-bold text-slate-800 leading-tight">Quick Chat</span>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200 group-hover:rotate-12 transition-transform duration-300">
                <MessageCircle size={28} strokeWidth={2.5} />
              </div>
            </motion.a>

            {/* Phone Button */}
            <motion.a
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              href={telUrl}
              className="group flex items-center gap-4 bg-white/90 backdrop-blur-md hover:bg-white px-5 py-4 rounded-3xl shadow-[0_20px_50px_rgba(59,130,246,0.2)] border border-blue-100 transition-all duration-300"
            >
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-blue-600 tracking-widest opacity-70">Direct Call</span>
                <span className="text-base font-bold text-slate-800 leading-tight">Voice Support</span>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:rotate-12 transition-transform duration-300">
                <Phone size={28} strokeWidth={2.5} />
              </div>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        layout
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 pointer-events-auto ${
          isOpen 
            ? 'bg-slate-900 text-white rotate-0' 
            : 'bg-[#904917] text-white hover:shadow-[#904917]/30'
        }`}
        aria-label={isOpen ? "Close contact menu" : "Open contact menu"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={28} strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key="message"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare size={30} strokeWidth={2.5} />
              <span className="absolute -top-3 -right-3 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-white shadow-sm flex items-center justify-center">
                   <span className="w-2 h-2 bg-[#904917] rounded-full"></span>
                </span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default FloatingContactWidget;
