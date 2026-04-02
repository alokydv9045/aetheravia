'use client';

import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { Clipboard, CheckCircle, Package, Truck, PartyPopper, XCircle, RotateCcw, MapPin, Clock } from 'lucide-react';

interface TimelineEvent {
  status: string;
  timestamp: string;
  description: string;
  location: string;
  metadata?: Record<string, any>;
}

interface OrderTimelineProps {
  orderId: string;
  timeline: TimelineEvent[];
  currentStatus: string;
  progress: {
    percentage: number;
    currentPhase: string;
    nextStatus?: string;
  };
  statusInfo: {
    label: string;
    description: string;
    color: string;
    icon: string;
  };
  trackingInfo?: {
    number: string;
    carrier: string;
    url?: string;
  };
  enableRealTime?: boolean;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({
  orderId,
  timeline: initialTimeline,
  currentStatus,
  progress,
  statusInfo,
  trackingInfo,
  enableRealTime = true,
}) => {
  const [timeline, setTimeline] = useState(initialTimeline);
  const [liveStatus, setLiveStatus] = useState(currentStatus);
  const [isConnected, setIsConnected] = useState(false);

  // Real-time updates using Server-Sent Events
  useEffect(() => {
    if (!enableRealTime) return;

    const eventSource = new EventSource(`/api/orders/${orderId}/live`);
    
    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('Connected to real-time order updates');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'status_update') {
          setTimeline(data.timeline || []);
          setLiveStatus(data.status || 'pending');
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      console.log('Disconnected from real-time updates');
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [orderId, enableRealTime]);

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clipboard />,
      confirmed: <CheckCircle />,
      processing: <Package />,
      shipped: <Truck />,
      out_for_delivery: <Truck />,
      delivered: <PartyPopper />,
      cancelled: <XCircle />,
      returned: <RotateCcw />,
    };
    return icons[status as keyof typeof icons] || <Clipboard />;
  };

  const getStatusColor = (status: string, isCurrent: boolean = false) => {
    const colors = {
      pending: isCurrent ? 'border-warning bg-warning/10' : 'border-gray-300 bg-gray-100',
      confirmed: isCurrent ? 'border-info bg-info/10' : 'border-gray-300 bg-gray-100',
      processing: isCurrent ? 'border-primary bg-primary/10' : 'border-gray-300 bg-gray-100',
      shipped: isCurrent ? 'border-primary bg-primary/10' : 'border-gray-300 bg-gray-100',
      out_for_delivery: isCurrent ? 'border-warning bg-warning/10' : 'border-gray-300 bg-gray-100',
      delivered: 'border-success bg-success/10',
      cancelled: 'border-error bg-error/10',
      returned: 'border-error bg-error/10',
    };
    return colors[status as keyof typeof colors] || 'border-gray-300 bg-gray-100';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Current Status Card */}
      <div className={`card bg-base-200 border-2 ${getStatusColor(liveStatus, true)}`}>
        <div className="card-body p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">{statusInfo.icon}</span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">{statusInfo.label}</h3>
                <p className="text-sm sm:text-base text-base-content/70">{statusInfo.description}</p>
              </div>
            </div>
            {enableRealTime && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-error'}`}></div>
                <span className="text-sm text-base-content/70">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span>Order Progress</span>
              <span className="font-semibold">{progress.percentage}%</span>
            </div>
            <div className="w-full bg-base-300 rounded-full h-2 sm:h-3">
              <div 
                className="bg-primary h-2 sm:h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Tracking Information */}
          {trackingInfo?.number && (
            <div className="mt-4 p-3 bg-base-300 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <p className="font-semibold text-sm sm:text-base">Tracking Number</p>
                  <p className="text-xs sm:text-sm text-base-content/70 font-mono break-all">
                    {trackingInfo.number}
                  </p>
                  {trackingInfo.carrier && (
                    <p className="text-xs text-base-content/60">via {trackingInfo.carrier}</p>
                  )}
                </div>
                {trackingInfo.url && (
                  <a 
                    href={trackingInfo.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary w-full sm:w-auto"
                  >
                    Track Package
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="card bg-base-100">
        <div className="card-body p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold mb-4">Order Timeline</h3>
          
          <div className="relative">
            {/* Timeline Line - Hidden on mobile, visible on larger screens */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-base-300 hidden sm:block"></div>
            
            <div className="space-y-4 sm:space-y-6">
              {timeline.map((event, index) => (
                <div key={index} className="relative flex items-start gap-3 sm:gap-4">
                  {/* Timeline Dot */}
                  <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center text-base sm:text-lg ${getStatusColor(event.status, event.status === liveStatus)} z-10`}>
                    {getStatusIcon(event.status)}
                  </div>
                  
                  {/* Event Content */}
                  <div className="flex-grow min-w-0 pb-4 sm:pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                      <h4 className="font-semibold text-sm sm:text-base pr-2">{event.description}</h4>
                      <span className="text-xs sm:text-sm text-base-content/60 whitespace-nowrap">
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-base-content/70">
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="inline" />
                          {event.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="inline" />
                        <span className="hidden sm:inline">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                        <span className="sm:hidden">
                          {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </span>
                    </div>

                    {/* Additional metadata */}
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-base-content/60">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <div key={key} className="break-words">
                            <span className="font-medium capitalize">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expected Next Update */}
      {progress.nextStatus && (
        <div className="card bg-base-200">
          <div className="card-body p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold">What&apos;s Next?</h3>
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl">{getStatusIcon(progress.nextStatus)}</span>
              <div>
                <p className="font-semibold text-sm sm:text-base capitalize">
                  {progress.nextStatus.replace('_', ' ')}
                </p>
                <p className="text-xs sm:text-sm text-base-content/70">
                  Your order will be updated once it reaches the next stage
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;