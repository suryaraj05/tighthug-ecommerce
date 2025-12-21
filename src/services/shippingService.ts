import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';

export interface TrackingInfo {
  trackingId: string;
  orderId: string;
  status: 'Processing' | 'Picked' | 'In Transit' | 'Out for Delivery' | 'Delivered';
  currentLocation?: string;
  estimatedDelivery?: string;
  courierPartner?: string;
  timeline?: TrackingEvent[];
}

export interface TrackingEvent {
  status: string;
  location?: string;
  timestamp: string;
  description: string;
}

export const getTrackingInfo = async (trackingId: string): Promise<TrackingInfo | null> => {
  try {
    const response = await axios.get(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.SHIPPING}/track/${trackingId}`
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch tracking information');
  }
};

export const getShippingByOrderId = async (orderId: string): Promise<TrackingInfo | null> => {
  try {
    const response = await axios.get(
      `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.SHIPPING}/order/${orderId}`
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch shipping information');
  }
};

