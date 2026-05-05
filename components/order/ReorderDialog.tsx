'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import useCartService from '@/lib/hooks/useCartStore';
import { OrderItem } from '@/lib/models/OrderModel';

interface ReorderItem {
  productId: string;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  originalQuantity: number;
  image: string;
  slug: string;
  countInStock: number;
  priceChanged: boolean;
  quantityReduced: boolean;
}

interface UnavailableItem {
  name: string;
  reason: string;
}

interface PriceChangedItem {
  name: string;
  originalPrice: number;
  currentPrice: number;
}

interface ReorderData {
  originalOrder: {
    _id: string;
    createdAt: string;
    totalPrice: number;
    itemsCount: number;
  };
  reorderItems: ReorderItem[];
  unavailableItems: UnavailableItem[];
  priceChangedItems: PriceChangedItem[];
  summary: {
    totalItems: number;
    unavailableCount: number;
    priceChangedCount: number;
    currentItemsPrice: number;
    originalItemsPrice: number;
    priceDifference: number;
    canReorder: boolean;
  };
}

interface ReorderDialogProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReorderDialog({ orderId, isOpen, onClose, onSuccess }: ReorderDialogProps) {
  const [reorderData, setReorderData] = useState<ReorderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const { increase, clear, items: currentCartItems } = useCartService();

  const fetchReorderData = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/orders/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to prepare reorder');
      }

      const data = await response.json();
      setReorderData(data.data);
      
      // Select all available items by default
      const availableItemIds = data.data.reorderItems.map((item: ReorderItem) => item.productId);
      setSelectedItems(new Set(availableItemIds));
    } catch (error) {
      console.error('Error fetching reorder data:', error);
      alert(error instanceof Error ? error.message : 'Failed to prepare reorder');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (clearCart = false) => {
    if (!reorderData || selectedItems.size === 0) return;

    setAddingToCart(true);
    try {
      const selectedReorderItems = reorderData.reorderItems.filter(item => 
        selectedItems.has(item.productId)
      );

      const response = await fetch('/api/orders/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: selectedReorderItems,
          clearCart,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add items to cart');
      }

      const data = await response.json();
      const cartItemsToAdd = data.data.cartItems;

      if (clearCart) {
        clear();
      }

      // Add each item to the Zustand store
      cartItemsToAdd.forEach((item: any) => {
        const orderItem: OrderItem = {
          _id: item.productId,
          productId: item.productId,
          name: item.name,
          slug: item.slug,
          qty: item.quantity,
          image: item.image,
          price: item.price,
          countInStock: item.countInStock,
          color: '',
          size: '',
        };
        // If clearCart is false, we should probably check if item already exists 
        // and add to its quantity, but increase() handles that.
        // However, increase() usually adds 1. 
        // We might need a direct 'addMany' or just loop increase.
        // Wait, increase(item) adds 1 of that item.
        // If we want to add 'quantity' items, we should loop.
        for (let i = 0; i < item.quantity; i++) {
          increase(orderItem);
        }
      });

      alert(`Successfully added ${selectedItems.size} items to your ritual bag!`);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error instanceof Error ? error.message : 'Failed to add items to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleItemSelection = (productId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedItems(newSelection);
  };

  const selectAllItems = () => {
    if (!reorderData) return;
    
    if (selectedItems.size === reorderData.reorderItems.length) {
      setSelectedItems(new Set());
    } else {
      const allItemIds = reorderData.reorderItems.map(item => item.productId);
      setSelectedItems(new Set(allItemIds));
    }
  };

  const calculateSelectedTotal = () => {
    if (!reorderData) return 0;
    
    return reorderData.reorderItems
      .filter(item => selectedItems.has(item.productId))
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Auto-fetch data when dialog opens
  if (isOpen && !reorderData && !loading) {
    fetchReorderData();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-primary-content p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Reorder Items</h2>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
              <span className="ml-3">Checking product availability...</span>
            </div>
          ) : reorderData ? (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="card bg-base-200">
                <div className="card-body p-4">
                  <h3 className="font-semibold mb-2">Original Order</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Order ID:</span>
                      <div className="font-medium">#{reorderData.originalOrder._id.slice(-8)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <div className="font-medium">
                        {new Date(reorderData.originalOrder.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Items:</span>
                      <div className="font-medium">{reorderData.originalOrder.itemsCount}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <div className="font-medium">{formatPrice(reorderData.originalOrder.totalPrice)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability Summary */}
              {(reorderData.summary.unavailableCount > 0 || reorderData.summary.priceChangedCount > 0) && (
                <div className="space-y-3">
                  {reorderData.summary.unavailableCount > 0 && (
                    <div className="alert alert-warning">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span>{reorderData.summary.unavailableCount} item(s) are no longer available</span>
                    </div>
                  )}
                  
                  {reorderData.summary.priceChangedCount > 0 && (
                    <div className="alert alert-info">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{reorderData.summary.priceChangedCount} item(s) have price changes</span>
                    </div>
                  )}
                </div>
              )}

              {/* Available Items */}
              {reorderData.reorderItems.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Available Items ({reorderData.reorderItems.length})</h3>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={selectAllItems}
                    >
                      {selectedItems.size === reorderData.reorderItems.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {reorderData.reorderItems.map((item) => (
                      <div
                        key={item.productId}
                        className={`card bg-base-100 border-2 cursor-pointer transition-colors ${
                          selectedItems.has(item.productId) ? 'border-primary bg-primary/5' : 'border-gray-200'
                        }`}
                        onClick={() => toggleItemSelection(item.productId)}
                      >
                        <div className="card-body p-4">
                          <div className="flex items-start gap-4">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-primary mt-1"
                              checked={selectedItems.has(item.productId)}
                              onChange={() => toggleItemSelection(item.productId)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-product.png';
                              }}
                            />
                            
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Quantity:</span>
                                  <span className="font-medium ml-1">
                                    {item.quantity}
                                    {item.quantityReduced && (
                                      <span className="text-warning ml-1">(was {item.originalQuantity})</span>
                                    )}
                                  </span>
                                </div>
                                
                                <div>
                                  <span className="text-gray-600">Price:</span>
                                  <span className="font-medium ml-1">
                                    {formatPrice(item.price)}
                                    {item.priceChanged && (
                                      <span className="text-info ml-1">(was {formatPrice(item.originalPrice)})</span>
                                    )}
                                  </span>
                                </div>
                                
                                <div>
                                  <span className="text-gray-600">Subtotal:</span>
                                  <span className="font-medium ml-1">
                                    {formatPrice(item.price * item.quantity)}
                                  </span>
                                </div>
                              </div>

                              {(item.priceChanged || item.quantityReduced) && (
                                <div className="flex gap-2 mt-2">
                                  {item.priceChanged && (
                                    <span className="badge badge-info badge-sm">Price Changed</span>
                                  )}
                                  {item.quantityReduced && (
                                    <span className="badge badge-warning badge-sm">Limited Stock</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unavailable Items */}
              {reorderData.unavailableItems.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-error">Unavailable Items ({reorderData.unavailableItems.length})</h3>
                  <div className="space-y-2">
                    {reorderData.unavailableItems.map((item, index) => (
                      <div key={index} className="card bg-error/10 border border-error/20">
                        <div className="card-body p-3">
                          <div className="flex items-center gap-3">
                            <span className="text-error">⚠️</span>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-error">{item.reason}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Failed to load reorder data. Please try again.</p>
              <button
                className="btn btn-primary mt-4"
                onClick={fetchReorderData}
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {reorderData && reorderData.summary.canReorder && (
          <div className="border-t p-4 bg-base-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-600">
                  {selectedItems.size} of {reorderData.reorderItems.length} items selected
                </div>
                <div className="text-lg font-bold">
                  Total: {formatPrice(calculateSelectedTotal())}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                className="btn btn-ghost"
                onClick={onClose}
              >
                Cancel
              </button>
              
              <button
                className={`btn btn-primary ${addingToCart ? 'loading' : ''}`}
                disabled={selectedItems.size === 0 || addingToCart}
                onClick={() => handleAddToCart(false)}
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              
              <button
                className={`btn btn-secondary ${addingToCart ? 'loading' : ''}`}
                disabled={selectedItems.size === 0 || addingToCart}
                onClick={() => handleAddToCart(true)}
              >
                {addingToCart ? 'Adding...' : 'Replace Cart'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}