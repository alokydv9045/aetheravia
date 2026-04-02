'use client';

import { useState, useCallback } from 'react';

interface AnalyticsFiltersProps {
  onFiltersChange: (filters: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
  isLoading?: boolean;
}

const periodOptions = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 3 months' },
  { value: '180', label: 'Last 6 months' },
  { value: '365', label: 'Last year' },
  { value: 'custom', label: 'Custom range' },
];

export default function AnalyticsFilters({ onFiltersChange, isLoading = false }: AnalyticsFiltersProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustomRange, setShowCustomRange] = useState(false);

  const handlePeriodChange = useCallback((period: string) => {
    setSelectedPeriod(period);
    
    if (period === 'custom') {
      setShowCustomRange(true);
      return;
    }
    
    setShowCustomRange(false);
    onFiltersChange({ period });
  }, [onFiltersChange]);

  const handleCustomRangeApply = useCallback(() => {
    if (startDate && endDate) {
      onFiltersChange({
        period: 'custom',
        startDate,
        endDate,
      });
    }
  }, [startDate, endDate, onFiltersChange]);

  const getQuickDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const setQuickRange = (days: number) => {
    const range = getQuickDateRange(days);
    setStartDate(range.start);
    setEndDate(range.end);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Period Selection */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Time Period:</label>
          <select
            className="select select-bordered select-sm"
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            disabled={isLoading}
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Date Range */}
        {showCustomRange && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="input input-bordered input-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading}
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              className="input input-bordered input-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isLoading}
            />
            <button
              className={`btn btn-primary btn-sm ${isLoading ? 'loading' : ''}`}
              onClick={handleCustomRangeApply}
              disabled={!startDate || !endDate || isLoading}
            >
              Apply
            </button>
          </div>
        )}

        {/* Quick Range Buttons for Custom */}
        {showCustomRange && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Quick:</span>
            {[7, 30, 90].map(days => (
              <button
                key={days}
                className="btn btn-xs btn-outline"
                onClick={() => setQuickRange(days)}
                disabled={isLoading}
              >
                {days}d
              </button>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <button
          className={`btn btn-ghost btn-sm ${isLoading ? 'loading' : ''}`}
          onClick={() => onFiltersChange({ period: selectedPeriod, startDate, endDate })}
          disabled={isLoading}
        >
          {!isLoading && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          Refresh
        </button>
      </div>

      {/* Current Selection Display */}
      <div className="mt-4 text-sm text-gray-600">
        {selectedPeriod === 'custom' && startDate && endDate ? (
          <span>📅 Custom range: {startDate} to {endDate}</span>
        ) : (
          <span>📅 {periodOptions.find(p => p.value === selectedPeriod)?.label}</span>
        )}
        {isLoading && <span className="ml-2">🔄 Loading...</span>}
      </div>
    </div>
  );
}