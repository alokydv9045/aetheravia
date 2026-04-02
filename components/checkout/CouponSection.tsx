'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import { formatPrice } from '@/lib/utils';

interface CouponSectionProps {
  orderValue: number;
  shippingCost: number;
  onCouponApplied: (couponData: any) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: any;
  className?: string;
}

const CouponSection = ({
  orderValue,
  shippingCost,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
  className = ''
}: CouponSectionProps) => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsValidating(true);
    
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          orderValue,
          shippingCost,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        onCouponApplied(data);
        setCouponCode('');
        setShowInput(false);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Error validating coupon');
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    onCouponRemoved();
    setCouponCode('');
    setShowInput(false);
    toast.success('Coupon removed');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateCoupon();
    }
  };

  const getDiscountText = (coupon: any) => {
    if (!coupon) return '';
    
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}% OFF`;
      case 'fixed_amount':
        return `${formatPrice(coupon.value)} OFF`;
      case 'free_shipping':
        return 'FREE SHIPPING';
      default:
        return 'DISCOUNT';
    }
  };

  return (
    <div className={`card bg-base-100 border border-base-300 ${className}`}>
      <div className="card-body p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            🎫 Discount Coupon
          </h3>
          {!appliedCoupon && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setShowInput(!showInput)}
            >
              {showInput ? 'Cancel' : 'Apply Coupon'}
            </button>
          )}
        </div>

        {/* Applied Coupon Display */}
        {appliedCoupon && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-success badge-sm sm:badge-md">
                    {appliedCoupon.coupon.code}
                  </span>
                  <span className="text-sm sm:text-base font-medium">
                    {getDiscountText(appliedCoupon.coupon)}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-success">
                  <span className="font-semibold">
                    You saved {formatPrice(appliedCoupon.discountAmount)}!
                  </span>
                  <div className="opacity-80">{appliedCoupon.coupon.name}</div>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-sm text-error"
                onClick={removeCoupon}
                title="Remove coupon"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Coupon Input */}
        {showInput && !appliedCoupon && (
          <div className="space-y-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-xs sm:text-sm">Enter coupon code</span>
              </label>
              <div className="join">
                <input
                  type="text"
                  className="input input-bordered join-item flex-1 input-sm sm:input-md"
                  placeholder="SAVE20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  disabled={isValidating}
                />
                <button
                  className="btn join-item btn-primary btn-sm sm:btn-md"
                  onClick={validateCoupon}
                  disabled={isValidating || !couponCode.trim()}
                >
                  {isValidating ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>
            </div>

            <div className="text-xs text-base-content/60">
              💡 <strong>Tips:</strong> Check your email for exclusive coupon codes, or try common codes like SAVE10, WELCOME20
            </div>
          </div>
        )}

        {/* Coupon Benefits Info */}
        {!appliedCoupon && !showInput && (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🎁</div>
            <p className="text-sm text-base-content/70 mb-3">
              Have a coupon code? Apply it to get instant discounts!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-success">💰</span>
                <span>Save Money</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-info">🚚</span>
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-warning">⚡</span>
                <span>Special Offers</span>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary with Discount */}
        {appliedCoupon && (
          <div className="border-t pt-4 mt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Original Total:</span>
                <span>{formatPrice(appliedCoupon.coupon.originalOrderValue || orderValue)}</span>
              </div>
              <div className="flex justify-between text-success">
                <span>Discount ({appliedCoupon.coupon.code}):</span>
                <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Final Total:</span>
                <span>{formatPrice(appliedCoupon.finalAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponSection;