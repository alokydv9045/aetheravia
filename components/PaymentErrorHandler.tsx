'use client';

import { useState } from 'react';
import { AlertCircle, RefreshCw, Settings, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  const getErrorInfo = (error: any) => {
    if (error?.message?.includes('500') || error?.status === 500) {
      return {
        type: 'server_error',
        title: 'Manifest Disruption',
        message: 'A temporary resonance issue has occurred within our gateway. Please attempt the ritual again.',
        severity: 'high',
        canRetry: true,
        suggestions: [
          'Wait for the digital landscape to stabilize',
          'Verify your connection to the archive',
          'Consider an alternative conduit of exchange'
        ]
      };
    }
    
    if (error?.message?.includes('credentials') || error?.message?.includes('unauthorized')) {
      return {
        type: 'configuration_error',
        title: 'Authentication Anomaly',
        message: 'Your credentials could not be verified by the heritage vault.',
        severity: 'critical',
        canRetry: false,
        suggestions: [
          'Seek guidance from the archive curators',
          'Verify your identity credentials',
          'Attempt the ritual at a later cycle'
        ]
      };
    }
    
    return {
      type: 'unknown_error',
      title: 'Unexpected Divergence',
      message: 'An unforeseen anomaly occurred during the manifest recording.',
      severity: 'medium',
      canRetry: true,
      suggestions: [
        'Refresh your current perspective',
        'Attempt the exchange once more',
        'Contact support if the anomaly persists'
      ]
    };
  };

  const errorInfo = getErrorInfo(error);
  
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-error bg-error/[0.03] text-error';
      case 'high': return 'border-primary bg-primary/[0.03] text-primary';
      default: return 'border-outline-variant/30 bg-surface-container-high/20 text-secondary';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded p-6 shadow-sm ${getSeverityStyle(errorInfo.severity)}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-full ${errorInfo.severity === 'critical' ? 'bg-error/10' : 'bg-primary/10'}`}>
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-headline text-xl italic mb-2">{errorInfo.title}</h3>
          <p className="font-body text-sm opacity-90 leading-relaxed mb-4">{errorInfo.message}</p>
          
          <div className="space-y-2 mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Recommended Disciplines:</p>
            <ul className="space-y-1">
              {errorInfo.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-center gap-2 text-[11px] font-body italic opacity-80">
                  <span className="w-1 h-1 rounded-full bg-current" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-2">
            {errorInfo.canRetry && onRetry && (
              <button
                onClick={onRetry}
                className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity"
              >
                <RefreshCw className="h-3 w-3" />
                Retry Ritual
              </button>
            )}
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-2 hover:opacity-100 transition-opacity"
            >
              <Settings className="h-3 w-3" />
              {showDetails ? 'Conceal' : 'Expose'} Details
            </button>

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-[10px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100 ml-auto"
              >
                Dismiss
              </button>
            )}
          </div>
          
          <AnimatePresence>
            {showDetails && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-6 pt-6 border-t border-current/10 font-mono text-[10px] space-y-2 opacity-60">
                  <p>Type: {errorInfo.type}</p>
                  <p>Detail: {error?.message || 'Unknown resonance'}</p>
                  {error?.status && <p>Pulse: {error.status}</p>}
                  <p>Epoch: {new Date().toISOString()}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}