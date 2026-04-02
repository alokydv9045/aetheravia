'use client';

import { useState } from 'react';
import ReorderDialog from './ReorderDialog';

interface ReorderButtonProps {
  orderId: string;
  orderStatus?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  disabled?: boolean;
  onSuccess?: () => void;
}

export default function ReorderButton({
  orderId,
  orderStatus = '',
  className = '',
  variant = 'outline',
  size = 'md',
  showText = true,
  disabled = false,
  onSuccess,
}: ReorderButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Only allow reordering for certain statuses
  const canReorder = ['delivered', 'cancelled'].includes(orderStatus.toLowerCase()) || !orderStatus;

  const handleClick = () => {
    if (!canReorder || disabled) return;
    setIsDialogOpen(true);
  };

  const getButtonClasses = () => {
    const baseClasses = 'btn';
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
    };
    const sizeClasses = {
      sm: 'btn-sm',
      md: '',
      lg: 'btn-lg',
    };

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  };

  if (!canReorder) {
    return null; // Don't show button for orders that can't be reordered
  }

  return (
    <>
      <button
        className={getButtonClasses()}
        onClick={handleClick}
        disabled={disabled}
        title={disabled ? 'Reorder not available' : 'Reorder these items'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} ${showText ? 'mr-2' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {showText && 'Reorder'}
      </button>

      <ReorderDialog
        orderId={orderId}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={onSuccess}
      />
    </>
  );
}