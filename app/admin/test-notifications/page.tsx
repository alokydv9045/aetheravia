'use client';

import { useState } from 'react';

export default function NotificationTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testNotificationConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/orders/test/notify');
      const data = await response.json();
      setTestResults(prev => [...prev, {
        test: 'Configuration Check',
        success: response.ok,
        data,
        timestamp: new Date().toLocaleString()
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: 'Configuration Check',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailService = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/orders/test/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: 'email',
          testEmail: 'test@example.com'
        })
      });
      const data = await response.json();
      setTestResults(prev => [...prev, {
        test: 'Email Service Test',
        success: response.ok,
        data,
        timestamp: new Date().toLocaleString()
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: 'Email Service Test',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const testSMSService = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/orders/test/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: 'sms',
          testPhone: '+1234567890'
        })
      });
      const data = await response.json();
      setTestResults(prev => [...prev, {
        test: 'SMS Service Test',
        success: response.ok,
        data,
        timestamp: new Date().toLocaleString()
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: 'SMS Service Test',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔔 Notification System Testing</h1>
        <p className="text-gray-600">
          Test and validate the notification system configuration and functionality.
        </p>
      </div>

      {/* Test Controls */}
      <div className="card bg-base-100 shadow mb-6">
        <div className="card-body">
          <h2 className="card-title">Test Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              className="btn btn-primary"
              onClick={testNotificationConfig}
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner loading-sm"></span> : '⚙️'}
              Check Config
            </button>
            
            <button
              className="btn btn-info"
              onClick={testEmailService}
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner loading-sm"></span> : '📧'}
              Test Email
            </button>
            
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              onClick={testSMSService}
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner loading-sm"></span> : '📱'}
              Test SMS
            </button>
            
            <button
              className="btn btn-ghost"
              onClick={clearResults}
              disabled={isLoading}
            >
              🗑️ Clear Results
            </button>
          </div>
        </div>
      </div>

      {/* Environment Setup Guide */}
      <div className="card bg-base-100 shadow mb-6">
        <div className="card-body">
          <h2 className="card-title">📋 Environment Setup</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Email Configuration (SMTP)</h3>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                SMTP_HOST=smtp.gmail.com<br/>
                SMTP_PORT=587<br/>
                SMTP_USER=your-email@gmail.com<br/>
                SMTP_PASS=your-app-password<br/>
                SMTP_FROM=noreply@yourdomain.com
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">SMS Configuration (Fast2SMS)</h3>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                FAST2SMS_API_KEY=your-fast2sms-api-key
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">📊 Test Results</h2>
          
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tests run yet. Click the test buttons above to start testing.
            </div>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`alert ${result.success ? 'alert-success' : 'alert-error'}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{result.test}</h3>
                      <span className="text-sm">{result.timestamp}</span>
                    </div>
                    
                    {result.success ? (
                      <div className="text-sm">
                        ✅ Test passed successfully
                        {result.data && (
                          <pre className="mt-2 bg-green-50 p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm">
                        ❌ Test failed: {result.error}
                        {result.data && (
                          <pre className="mt-2 bg-red-50 p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Usage Examples */}
      <div className="card bg-base-100 shadow mt-6">
        <div className="card-body">
          <h2 className="card-title">💡 Usage Examples</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Automatic Notifications</h3>
              <p className="text-sm text-gray-600 mb-2">
                Notifications are automatically sent when order status changes through:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Admin order status updates</li>
                <li>Order processing workflow</li>
                <li>3PL integration status changes</li>
                <li>Payment confirmation events</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Manual Notifications</h3>
              <p className="text-sm text-gray-600 mb-2">
                Send notifications manually from:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Admin order detail page → Actions tab</li>
                <li>Order notification panel interface</li>
                <li>API endpoint: POST /api/admin/orders/[id]/notify</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Notification Channels</h3>
              <p className="text-sm text-gray-600 mb-2">
                Configure which notifications to send:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>Email</strong>: Detailed order information with tracking</li>
                <li><strong>SMS</strong>: Concise status updates and tracking links</li>
                <li><strong>Future</strong>: WhatsApp Business API integration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}