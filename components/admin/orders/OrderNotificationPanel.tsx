'use client';

import { useState, useEffect } from 'react';
import { Check, X, Mail } from 'lucide-react';

interface OrderNotificationPanelProps {
  orderId: string;
  orderNumber: string;
  customerEmail?: string;
  customerPhone?: string;
}

interface NotificationConfig {
  email: boolean;
  sms: boolean;
}

interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  channel: 'email' | 'sms';
}

export default function OrderNotificationPanel({
  orderId,
  orderNumber,
  customerEmail,
  customerPhone,
}: OrderNotificationPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<NotificationConfig>({
    email: !!customerEmail,
    sms: false,
  });
  const [lastResults, setLastResults] = useState<NotificationResult[] | null>(null);
  const [serviceConfig, setServiceConfig] = useState<{
    email: { configured: boolean };
    sms: { configured: boolean };
  } | null>(null);

  // Check notification service configuration on mount
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}/notify`);
        if (response.ok) {
          const data = await response.json();
          setServiceConfig(data);
        }
      } catch (error) {
        console.error('Failed to check notification config:', error);
      }
    };
    checkConfig();
  }, [orderId]);

  const handleSendNotification = async () => {
    if (!config.email && !config.sms) {
      alert('Please select at least one notification method');
      return;
    }

    setIsLoading(true);
    setLastResults(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          notifyEmail: config.email,
          notifySMS: config.sms,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLastResults(data.results.details);
      } else {
        alert(`Failed to send notification: ${data.error}`);
      }
    } catch (error) {
      console.error('Notification error:', error);
      alert('Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  const getResultIcon = (result: NotificationResult) => {
    if (result.success) {
      return <Check className="text-success" />;
    }
    return <X className="text-error" />;
  };

  const getResultMessage = (result: NotificationResult) => {
    if (result.success) {
      return `${result.channel.toUpperCase()} sent successfully`;
    }
    return `${result.channel.toUpperCase()} failed: ${result.error}`;
  };

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h3 className="card-title">
          <Mail className="inline mr-2" /> Send Notification
        </h3>

        <div className="space-y-4">
          {/* Notification Methods */}
          <div className="space-y-3">
            <h4 className="font-semibold">Notification Methods:</h4>
            
            {/* Email Option */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={config.email}
                  onChange={(e) => setConfig(prev => ({ ...prev, email: e.target.checked }))}
                  disabled={!customerEmail || !serviceConfig?.email.configured}
                />
                <div className="flex-1">
                  <span className="label-text font-medium">Email Notification</span>
                  {customerEmail ? (
                    <div className="text-sm text-gray-600">{customerEmail}</div>
                  ) : (
                    <div className="text-sm text-error">No email address available</div>
                  )}
                  {!serviceConfig?.email.configured && (
                    <div className="text-sm text-warning">SMTP not configured</div>
                  )}
                </div>
              </label>
            </div>

            {/* SMS Option */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={config.sms}
                  onChange={(e) => setConfig(prev => ({ ...prev, sms: e.target.checked }))}
                  disabled={!customerPhone || !serviceConfig?.sms.configured}
                />
                <div className="flex-1">
                  <span className="label-text font-medium">SMS Notification</span>
                  {customerPhone ? (
                    <div className="text-sm text-gray-600">{customerPhone}</div>
                  ) : (
                    <div className="text-sm text-error">No phone number available</div>
                  )}
                  {!serviceConfig?.sms.configured && (
                    <div className="text-sm text-warning">Fast2SMS not configured</div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Send Button */}
          <div className="card-actions">
            <button
              className="btn btn-primary"
              onClick={handleSendNotification}
              disabled={isLoading || (!config.email && !config.sms)}
            >
              {isLoading && <span className="loading loading-spinner loading-sm"></span>}
              {isLoading ? 'Sending...' : 'Send Notification'}
            </button>
          </div>

          {/* Results */}
          {lastResults && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Notification Results:</h4>
              <div className="space-y-2">
                {lastResults.map((result, index) => (
                  <div
                    key={index}
                    className={`alert ${result.success ? 'alert-success' : 'alert-error'}`}
                  >
                    <div className="flex items-center gap-2">
                      {getResultIcon(result)}
                      <span>{getResultMessage(result)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Status */}
          {serviceConfig && (
            <div className="mt-4 text-sm">
              <h4 className="font-semibold mb-2">Service Status:</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {serviceConfig.email.configured ? <Check className="text-success" /> : <X className="text-error" />}
                  <span>Email Service {serviceConfig.email.configured ? 'Configured' : 'Not Configured'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {serviceConfig.sms.configured ? <Check className="text-success" /> : <X className="text-error" />}
                  <span>SMS Service {serviceConfig.sms.configured ? 'Configured' : 'Not Configured'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-info/10 p-3 rounded-lg">
            <div className="text-sm text-info-content">
              <strong>Note:</strong> This will send a notification about the current order status to the customer.
              Make sure the order status is up-to-date before sending.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}