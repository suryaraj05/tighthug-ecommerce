import { TrackingInfo } from '@/services/shippingService';
import { formatDate } from '@/utils/helpers';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle2, Package, Truck, MapPin } from 'lucide-react';
import { useState } from 'react';
import { copyToClipboard } from '@/utils/helpers';
import { toast } from 'sonner';

interface TrackingWidgetProps {
  tracking: TrackingInfo;
}

const TrackingWidget = ({ tracking }: TrackingWidgetProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyTracking = async () => {
    const success = await copyToClipboard(tracking.trackingId);
    if (success) {
      setCopied(true);
      toast.success('Tracking number copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusIcons = {
    Processing: Package,
    Picked: Package,
    'In Transit': Truck,
    'Out for Delivery': Truck,
    Delivered: CheckCircle2,
  };

  const StatusIcon = statusIcons[tracking.status] || Package;

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-sm mb-1">Tracking Information</h3>
          <div className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5 text-gray-600" />
            <Badge variant={tracking.status === 'Delivered' ? 'default' : 'secondary'}>
              {tracking.status}
            </Badge>
          </div>
        </div>
      </div>

      {tracking.trackingId && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tracking Number</span>
            <button
              onClick={handleCopyTracking}
              className="flex items-center gap-1 text-sm text-black hover:underline"
            >
              {tracking.trackingId}
              <Copy className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {tracking.currentLocation && (
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-gray-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Current Location</p>
            <p className="text-sm text-gray-600">{tracking.currentLocation}</p>
          </div>
        </div>
      )}

      {tracking.estimatedDelivery && (
        <div>
          <p className="text-sm font-medium">Estimated Delivery</p>
          <p className="text-sm text-gray-600">
            {formatDate(tracking.estimatedDelivery)}
          </p>
        </div>
      )}

      {tracking.courierPartner && (
        <div>
          <p className="text-sm font-medium">Courier Partner</p>
          <p className="text-sm text-gray-600">{tracking.courierPartner}</p>
        </div>
      )}
    </div>
  );
};

export default TrackingWidget;

