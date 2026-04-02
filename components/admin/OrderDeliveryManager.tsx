'use client';

import { useState, useEffect } from 'react';

interface DeliveryPartner {
  provider: string;
  name: string;
  description: string;
  features: string[];
  estimatedDelivery?: string;
  cost?: number;
  available: boolean;
}

interface OrderDeliveryManagerProps {
  orderId: string;
  onAssign: (orderId: string, provider: string) => void;
  onClose: () => void;
}

export default function OrderDeliveryManager({ 
  orderId, 
  onAssign, 
  onClose 
}: OrderDeliveryManagerProps) {
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [error, setError] = useState('');

  // Fetch available delivery partners
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/delivery-partners/available?orderId=${orderId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch delivery partners');
        }

        const data = await response.json();
        setPartners(data.partners || []);
      } catch (err) {
        console.error('Error fetching delivery partners:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch delivery partners');
        
        // Fallback partners if API fails
        setPartners([
          {
            provider: 'shippo',
            name: 'Shippo',
            description: 'Multi-carrier shipping platform with competitive rates',
            features: ['Real-time tracking', 'Multiple carriers', 'Insurance'],
            available: true,
          },
          {
            provider: 'delivery_com',
            name: 'Delivery.com',
            description: 'Same-day and next-day delivery service',
            features: ['Same-day delivery', 'Local coverage', 'Live tracking'],
            available: true,
          },
          {
            provider: 'ecart',
            name: 'eCart',
            description: 'E-commerce focused delivery solutions',
            features: ['E-commerce integration', 'Bulk shipping', 'Analytics'],
            available: true,
          },
          {
            provider: 'auto',
            name: 'Auto Select',
            description: 'Automatically select the best delivery partner',
            features: ['Best rate', 'Fastest delivery', 'Smart selection'],
            available: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [orderId]);

  const handleAssign = async () => {
    if (!selectedProvider) {
      setError('Please select a delivery partner');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onAssign(orderId, selectedProvider);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign delivery partner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Assign Delivery Partner</h2>
          <button
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-base-content/70 mb-6">
            Select a delivery partner for order #{orderId.slice(-8)}
          </p>

          {error && (
            <div className="alert alert-error mb-6">
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <div className="space-y-4">
              {partners.map((partner) => (
                <div
                  key={partner.provider}
                  className={`card border-2 cursor-pointer transition-all ${
                    selectedProvider === partner.provider
                      ? 'border-primary bg-primary/5'
                      : 'border-base-300 hover:border-base-400'
                  } ${!partner.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => partner.available && setSelectedProvider(partner.provider)}
                >
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="delivery-partner"
                          className="radio radio-primary mt-1"
                          checked={selectedProvider === partner.provider}
                          onChange={() => setSelectedProvider(partner.provider)}
                          disabled={!partner.available}
                        />
                        <div>
                          <h3 className="font-bold text-lg">{partner.name}</h3>
                          <p className="text-base-content/70 mb-2">{partner.description}</p>
                          
                          {/* Features */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {partner.features.map((feature, index) => (
                              <span
                                key={index}
                                className="badge badge-outline badge-sm"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>

                          {/* Additional info */}
                          <div className="flex gap-4 text-sm text-base-content/70">
                            {partner.estimatedDelivery && (
                              <span>📅 {partner.estimatedDelivery}</span>
                            )}
                            {partner.cost && (
                              <span>💰 ${partner.cost}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {!partner.available && (
                        <span className="badge badge-error">Unavailable</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAssign}
            disabled={loading || !selectedProvider}
          >
            {loading && <span className="loading loading-spinner loading-sm"></span>}
            Assign Partner
          </button>
        </div>
      </div>
    </div>
  );
}