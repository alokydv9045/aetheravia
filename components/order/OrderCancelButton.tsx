'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface OrderCancelButtonProps {
  orderId: string;
  orderStatus: string;
  onCancelSuccess?: () => void;
  className?: string;
}

export default function OrderCancelButton({
  orderId,
  orderStatus,
  onCancelSuccess,
  className = ''
}: OrderCancelButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Check if order can be cancelled
  const canCancel = ['pending', 'confirmed', 'processing'].includes(orderStatus.toLowerCase());

  const handleCancelClick = () => {
    if (!canCancel) {
      toast.error('This order cannot be cancelled at this stage');
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: cancelReason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Order cancelled successfully');
        setIsModalOpen(false);
        setCancelReason('');
        onCancelSuccess?.();
      } else {
        toast.error(data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      toast.error('Failed to cancel order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (isLoading) return;
    setIsModalOpen(false);
    setCancelReason('');
  };

  if (!canCancel) {
    return null; // Don't show button if order can't be cancelled
  }

  return (
    <>
      <button 
        className={`bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors ${className}`}
        onClick={handleCancelClick}
        disabled={isLoading}
      >
        Cancel Order
      </button>

      {/* Cancellation Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Cancel Order</h3>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Reason for cancellation *</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Select a reason</option>
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Found a better price">Found a better price</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="No longer needed">No longer needed</option>
                  <option value="Delivery taking too long">Delivery taking too long</option>
                  <option value="Payment issues">Payment issues</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {cancelReason === 'Other' && (
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">Please specify</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered"
                    placeholder="Please provide more details..."
                    value={cancelReason === 'Other' ? '' : cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={handleCloseModal}
                disabled={isLoading}
              >
                Keep Order
              </button>
              <button 
                className={`btn btn-error ${isLoading ? 'loading' : ''}`}
                onClick={handleConfirmCancel}
                disabled={isLoading || !cancelReason.trim()}
              >
                {isLoading ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={handleCloseModal}></div>
        </div>
      )}
    </>
  );
}