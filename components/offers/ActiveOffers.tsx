"use client";
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Image from 'next/image';

interface Offer {
  _id: string;
  title: string;
  description?: string;
  content: string;
  type: 'popup' | 'banner' | 'flashSale';
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  priority: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ActiveOffers() {
  const { data, error } = useSWR<{ offers: Offer[] }>('/api/offers/active', fetcher);
  const [dismissedPopups, setDismissedPopups] = useState<string[]>([]);

  useEffect(() => {
    // Load dismissed popups from localStorage
    const dismissed = JSON.parse(localStorage.getItem('dismissedPopups') || '[]');
    setDismissedPopups(dismissed);
  }, []);

  const dismissPopup = (offerId: string) => {
    const newDismissed = [...dismissedPopups, offerId];
    setDismissedPopups(newDismissed);
    localStorage.setItem('dismissedPopups', JSON.stringify(newDismissed));
  };

  if (error) return null;
  if (!data) return null;

  const activeOffers = data.offers || [];
  const popups = activeOffers.filter(offer => 
    offer.type === 'popup' && 
    !dismissedPopups.includes(offer._id)
  );
  const banners = activeOffers.filter(offer => offer.type === 'banner');
  const flashSales = activeOffers.filter(offer => offer.type === 'flashSale');

  return (
    <>
      {/* Banners */}
      {banners.map(banner => (
        <div key={banner._id} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 mb-4 rounded-lg shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {banner.imageUrl && (
                <Image 
                  src={banner.imageUrl} 
                  alt={banner.title} 
                  width={48}
                  height={48}
                  className="rounded-full object-cover" 
                />
              )}
              <div>
                <h3 className="font-bold text-lg">{banner.title}</h3>
                {banner.description && (
                  <p className="text-sm opacity-90">{banner.description}</p>
                )}
              </div>
            </div>
            <div className="text-sm opacity-75">
              {banner.endDate && `Ends: ${new Date(banner.endDate).toLocaleDateString()}`}
            </div>
          </div>
        </div>
      ))}

      {/* Flash Sales */}
      {flashSales.length > 0 && (
        <div className="bg-red-500 text-white p-4 mb-4 rounded-lg shadow-lg animate-pulse">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl">⚡ FLASH SALE ⚡</h3>
                <div className="mt-2">
                  {flashSales.map(sale => (
                    <div key={sale._id} className="mb-2">
                      <p className="font-semibold">{sale.title}</p>
                      {sale.description && (
                        <p className="text-sm opacity-90">{sale.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm">Limited Time</p>
                {flashSales[0]?.endDate && (
                  <p className="text-xs opacity-75">
                    Ends: {new Date(flashSales[0].endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popups */}
      {popups.map(popup => (
        <div key={popup._id} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 relative">
            <button 
              onClick={() => dismissPopup(popup._id)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
            
            {popup.imageUrl && (
              <Image 
                src={popup.imageUrl} 
                alt={popup.title} 
                width={400}
                height={160}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
            )}
            
            <h3 className="text-xl font-bold mb-2 text-gray-800">{popup.title}</h3>
            
            {popup.description && (
              <p className="text-gray-600 mb-4">{popup.description}</p>
            )}
            
            <div 
              className="text-gray-800 mb-4"
              dangerouslySetInnerHTML={{ __html: popup.content }}
            />
            
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => dismissPopup(popup._id)}
                className="btn btn-ghost"
              >
                Close
              </button>
              <button className="btn btn-primary">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}