import { TrackingInfo, TrackingEvent } from '@/services/shippingService';
import { formatDateTime } from '@/utils/helpers';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingTimelineProps {
  tracking: TrackingInfo;
}

const statusOrder = [
  'Processing',
  'Picked',
  'In Transit',
  'Out for Delivery',
  'Delivered',
];

const TrackingTimeline = ({ tracking }: TrackingTimelineProps) => {
  const currentStatusIndex = statusOrder.indexOf(tracking.status);
  const timeline = tracking.timeline || [];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Status Timeline</h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="space-y-6">
          {statusOrder.map((status, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const timelineEvent = timeline.find((e) => e.status === status);

            return (
              <div key={status} className="relative flex items-start gap-4">
                <div className="relative z-10 flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2
                      className={cn(
                        'h-8 w-8',
                        isCurrent ? 'text-black' : 'text-gray-400'
                      )}
                    />
                  ) : (
                    <Circle className="h-8 w-8 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCurrent ? 'text-black' : 'text-gray-600'
                    )}
                  >
                    {status}
                  </p>
                  {timelineEvent && (
                    <>
                      <p className="text-xs text-gray-500 mt-1">
                        {timelineEvent.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDateTime(timelineEvent.timestamp)}
                      </p>
                      {timelineEvent.location && (
                        <p className="text-xs text-gray-400">
                          {timelineEvent.location}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrackingTimeline;

