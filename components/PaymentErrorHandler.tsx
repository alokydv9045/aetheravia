'use client';

import { useState } from 'react';
import { AlertCircle, RefreshCw, Settings, ExternalLink } from 'lucide-react';

interface PaymentErrorHandlerProps {
  error: any;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function PaymentErrorHandler({ 
  error, 
  onRetry, 
  onDismiss 
}: PaymentErrorHandlerProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Analyze error type
  const getErrorInfo = (error: any) => {
    if (error?.message?.includes('500') || error?.status === 500) {
      return {
        type: 'server_error',
        title: 'Payment Service Unavailable',
        message: 'There is a temporary issue with the payment service. Please try again in a moment.',
        severity: 'high',
        canRetry: true,
        suggestions: [
          'Wait a few moments and try again',
          'Check your internet connection',
          'Try a different payment method'
        ]
      };
    }
    
    if (error?.message?.includes('credentials') || error?.message?.includes('unauthorized')) {
      return {
        type: 'configuration_error',
        title: 'Payment Configuration Issue',
        message: 'There is a configuration issue with the payment system.',
        severity: 'critical',
        canRetry: false,
        suggestions: [
          'Please contact customer support',
          'Try again later',
          'Use alternative payment methods'
        ]
      };
    }
    
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return {
        type: 'network_error',
        title: 'Connection Issue',
        message: 'Unable to connect to payment services. Please check your internet connection.',
        severity: 'medium',
        canRetry: true,
        suggestions: [
          'Check your internet connection',
          'Disable VPN if using one',
          'Try refreshing the page'
        ]
      };
    }
    
    return {
      type: 'unknown_error',
      title: 'Payment Error',
      message: 'An unexpected error occurred during payment processing.',
      severity: 'medium',
      canRetry: true,
      suggestions: [
        'Try again in a moment',
        'Refresh the page',
        'Contact support if the issue persists'
      ]
    };
  };

  const errorInfo = getErrorInfo(error);
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-error border-error bg-error/10';
      case 'high': return 'text-warning border-warning bg-warning/10';
      case 'medium': return 'text-info border-info bg-info/10';
      default: return 'text-base-content border-base-300 bg-base-200/50';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getSeverityColor(errorInfo.severity)}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">{errorInfo.title}</h3>
          <p className="mb-3">{errorInfo.message}</p>
          
          {errorInfo.suggestions.length > 0 && (
            <div className="mb-3">
              <p className="font-medium mb-2">Suggested Actions:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {errorInfo.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mb-3">
            {errorInfo.canRetry && onRetry && (
              <button
                onClick={onRetry}
                className="btn btn-sm btn-primary"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Try Again
              </button>
            )}
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="btn btn-sm btn-ghost"
              >
                Dismiss
              </button>
            )}
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="btn btn-sm btn-ghost"
            >
              <Settings className="h-4 w-4 mr-1" />
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          {showDetails && (
            <div className="mt-3 p-3 bg-base-100/50 rounded border">
              <h4 className="font-medium mb-2">Technical Details:</h4>
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-medium">Error Type:</span> {errorInfo.type}
                </div>
                <div>
                  <span className="font-medium">Message:</span> {error?.message || 'Unknown error'}
                </div>
                {error?.status && (
                  <div>
                    <span className="font-medium">Status Code:</span> {error.status}
                  </div>
                )}
                {error?.code && (
                  <div>
                    <span className="font-medium">Error Code:</span> {error.code}
                  </div>
                )}
                <div>
                  <span className="font-medium">Timestamp:</span> {new Date().toLocaleString()}
                </div>
              </div>
            </div>
          )}
          
          {errorInfo.severity === 'critical' && (
            <div className="mt-3 p-3 bg-error/20 border border-error/50 rounded">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Need Help?</span>
              </div>
              <p className="text-sm mb-2">
                If this issue persists, please contact our support team with the error details above.
              </p>
              <a
                href="mailto:support@bellamoda.com"
                className="btn btn-sm btn-error btn-outline"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Contact Support
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}