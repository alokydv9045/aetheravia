'use client';

import { useState } from 'react';
import { Settings, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  config?: any;
  testResult?: any;
  apiError?: any;
  recommendations?: string[];
}

export default function RazorpayTestPage() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runConfigurationTest = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test/razorpay');
      const data: TestResult = await response.json();
      setTestResult(data);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: 'Failed to run configuration test',
        recommendations: [
          'Check if the server is running',
          'Verify API endpoint is accessible',
          'Check network connectivity'
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-success" />
    ) : (
      <XCircle className="h-5 w-5 text-error" />
    );
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'border-success bg-success/10' : 'border-error bg-error/10';
  };

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Razorpay Configuration Test</h1>
                <p className="text-base-content/70">
                  Test your Razorpay integration and troubleshoot payment issues
                </p>
              </div>
            </div>

            <div className="card bg-base-200 mb-6">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">Current Issues Being Investigated</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                    <span>Razorpay API returning 500 Internal Server Error</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                    <span>Payment validation failing during checkout</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                    <span>UPI app launch failures (expected on desktop)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <button
                onClick={runConfigurationTest}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isLoading ? 'Testing...' : 'Run Configuration Test'}
              </button>
            </div>

            {testResult && (
              <div className={`border rounded-lg p-6 ${getStatusColor(testResult.success)}`}>
                <div className="flex items-start gap-3 mb-4">
                  {getStatusIcon(testResult.success)}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {testResult.success ? 'Configuration Test Passed' : 'Configuration Test Failed'}
                    </h3>
                    <p className="mb-4">{testResult.message}</p>

                    {testResult.config && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Configuration Status:</h4>
                        <div className="bg-base-100/50 rounded p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span>API Key ID:</span>
                            <div className="flex items-center gap-2">
                              {testResult.config.keyId?.present ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-success" />
                                  <code className="text-xs">
                                    {testResult.config.keyId.prefix} ({testResult.config.keyId.format})
                                  </code>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 text-error" />
                                  <span className="text-error">Not configured</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>API Key Secret:</span>
                            <div className="flex items-center gap-2">
                              {testResult.config.keySecret?.present ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-success" />
                                  <span className="text-success">
                                    Configured ({testResult.config.keySecret.length} chars)
                                  </span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 text-error" />
                                  <span className="text-error">Not configured</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {testResult.testResult && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">API Test Results:</h4>
                        <div className="bg-base-100/50 rounded p-3 space-y-2">
                          <div>Order ID: <code>{testResult.testResult.orderId}</code></div>
                          <div>Amount: <code>{testResult.testResult.amount / 100} INR</code></div>
                          <div>Status: <code>{testResult.testResult.status}</code></div>
                        </div>
                      </div>
                    )}

                    {testResult.apiError && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">API Error Details:</h4>
                        <div className="bg-base-100/50 rounded p-3 space-y-2">
                          <div>Status: <code>{testResult.apiError.status}</code></div>
                          <div>Status Text: <code>{testResult.apiError.statusText}</code></div>
                          {testResult.apiError.details && (
                            <div>
                              <span>Details:</span>
                              <pre className="mt-1 text-xs bg-base-200 p-2 rounded overflow-auto">
                                {JSON.stringify(testResult.apiError.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {testResult.recommendations && testResult.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {testResult.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-info/10 border border-info/20 rounded-lg">
              <h3 className="font-medium mb-2">💡 Troubleshooting Tips</h3>
              <ul className="text-sm space-y-1">
                <li>• Ensure your Razorpay account is activated for test payments</li>
                <li>• Verify your API keys are correct and not expired</li>
                <li>• Check that test mode is enabled in your Razorpay dashboard</li>
                <li>• Make sure your account has sufficient permissions</li>
                <li>• Verify network connectivity to api.razorpay.com</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}