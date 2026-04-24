'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const steps = [
  { id: 0, name: 'Identity', icon: 'person' },
  { id: 1, name: 'Shipping', icon: 'local_shipping' },
  { id: 2, name: 'Payment', icon: 'account_balance_wallet' },
  { id: 3, name: 'Review', icon: 'fact_check' },
];

const CheckoutSteps = ({ current = 0 }) => {
  return (
    <div className="w-full py-12 px-4 mb-8">
      <div className="max-w-4xl mx-auto relative">
        {/* Connection Line Background */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-outline-variant/20 -translate-y-1/2 z-0" />
        
        {/* Active Connection Line */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(current / (steps.length - 1)) * 100}%` }}
          className="absolute top-1/2 left-0 h-[1px] bg-primary -translate-y-1/2 z-0 origin-left transition-all duration-700"
        />

        <div className="relative z-10 flex justify-between items-center">
          {steps.map((step, index) => {
            const isCompleted = index < current;
            const isActive = index === current;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isActive || isCompleted ? 'var(--color-primary)' : 'var(--color-surface-container-low)',
                    borderColor: isActive || isCompleted ? 'var(--color-primary)' : 'var(--color-outline-variant)',
                    scale: isActive ? 1.1 : 1,
                  }}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-500 shadow-sm ${
                    isActive || isCompleted ? 'text-white' : 'text-secondary/40'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={18} strokeWidth={3} />
                  ) : (
                    <span className="material-symbols-outlined text-sm font-light">
                      {step.icon}
                    </span>
                  )}
                </motion.div>
                
                <div className="absolute mt-14 text-center">
                  <p className={`text-[10px] font-label uppercase tracking-[0.2em] font-bold transition-colors duration-500 ${
                    isActive ? 'text-primary' : isCompleted ? 'text-secondary' : 'text-secondary/30'
                  }`}>
                    {step.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CheckoutSteps;
