'use client';

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { useEffect, useState } from 'react';
import toast, { Toaster, ToastBar } from 'react-hot-toast';
import { SWRConfig } from 'swr';
import { X } from 'lucide-react';

import { cartStore } from '@/lib/hooks/useCartStore';
import useLayoutService from '@/lib/hooks/useLayout';

const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useLayoutService();
  const [selectedTheme, setSelectedTheme] = useState('system');

  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  const updateStore = () => {
    cartStore.persist.rehydrate();
  };

  // cart will be refreshed on cart change  n browser
  useEffect(() => {
    document.addEventListener('visibilitychange', updateStore);
    window.addEventListener('focus', updateStore);
    return () => {
      document.removeEventListener('visibilitychange', updateStore);
      window.removeEventListener('focus', updateStore);
    };
  }, []);

  return (
    <SWRConfig
      value={{
        onError: (error, key) => {
          // Use the error message as ID to prevent duplicates
          toast.error(error.message, { id: error.message });
        },
        fetcher: async (resource, init) => {
          const res = await fetch(resource, init);
          if (!res.ok) {
            // Throwing a standard error message that will be deduplicated by ID
            throw new Error('An error occurred while fetching the data.');
          }
          return res.json();
        },
      }}
    >
      <div data-theme={selectedTheme} className='flex min-h-screen flex-col'>
        <Toaster toastOptions={{ className: 'toaster-con' }}>
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <div className="flex items-center">
                  {icon}
                  <div className="mx-2 text-sm font-medium">{message}</div>
                  {t.type !== 'loading' && (
                    <button 
                      className="ml-2 p-1 rounded-full hover:bg-black/10 transition-colors"
                      onClick={() => toast.dismiss(t.id)}
                      aria-label="Close notification"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}
            </ToastBar>
          )}
        </Toaster>
        <ProgressBar />
        {children}
      </div>
    </SWRConfig>
  );
};

export default ClientProvider;
