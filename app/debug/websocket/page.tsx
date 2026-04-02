'use client';

import { useState } from 'react';
import RealTimeOrderStatus from '@/components/order/RealTimeOrderStatus';
import AdminOrderManager from '@/components/admin/AdminOrderManager';

export default function WebSocketDemo() {
  const [demoOrderId] = useState('demo-order-123');
  const [currentStatus, setCurrentStatus] = useState('pending');

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    console.log(`Order ${orderId} status updated to: ${newStatus}`);
    setCurrentStatus(newStatus);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Real-time Order Tracking Demo</h1>
          <p className="text-gray-600">
            This demo showcases the real-time WebSocket functionality for order tracking.
            Use the admin panel on the right to update order status and see the changes
            reflected in real-time on the customer view on the left.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer View */}
          <div className="space-y-4">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">Customer View</h2>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-blue-800">Order #{demoOrderId}</h3>
                  <p className="text-blue-600 text-sm">Real-time status updates</p>
                </div>
                <RealTimeOrderStatus 
                  orderId={demoOrderId}
                  initialStatus={currentStatus}
                  className="bg-white p-4 rounded-lg border"
                />
              </div>
            </div>
          </div>

          {/* Admin View */}
          <div className="space-y-4">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">Admin Panel</h2>
                <div className="bg-orange-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-orange-800">Managing Order #{demoOrderId}</h3>
                  <p className="text-orange-600 text-sm">Update status to see real-time changes</p>
                </div>
                <AdminOrderManager
                  orderId={demoOrderId}
                  currentStatus={currentStatus}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">How to Test</h3>
            <div className="space-y-2 text-sm">
              <p>1. The customer view on the left shows the current order status with a live connection indicator</p>
              <p>2. Use the admin panel on the right to update the order status</p>
              <p>3. Watch as the customer view updates in real-time without page refresh</p>
              <p>4. The green dot indicates an active WebSocket connection</p>
              <p>5. Try using the quick action buttons for common status transitions</p>
            </div>
          </div>
        </div>

        {/* Development Info */}
        <div className="mt-4 card bg-gray-50 shadow-sm">
          <div className="card-body">
            <h4 className="card-title text-sm">Development Information</h4>
            <div className="text-xs space-y-1 text-gray-600">
              <p>• WebSocket Status: <span className="font-mono">Socket.IO Client + Server</span></p>
              <p>• Order ID: <span className="font-mono">{demoOrderId}</span></p>
              <p>• Current Status: <span className="font-mono">{currentStatus}</span></p>
              <p>• Connection: <span className="font-mono">Real-time bidirectional</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}