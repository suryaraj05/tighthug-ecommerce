// Analytics service for tracking page views and user actions
// Can be integrated with Google Analytics, Firebase Analytics, or custom tracking

export const trackPageView = (_pageName: string, _additionalData?: Record<string, any>) => {
  // Wire to Firebase Analytics / GA when ready
};

export const trackEvent = (_eventName: string, _eventData?: Record<string, any>) => {
  // Wire to Firebase Analytics / GA when ready
};

export const trackConversion = (conversionType: string, value?: number) => {
  trackEvent('conversion', {
    type: conversionType,
    value,
  });
};

export const trackAddToCart = (productId: string, productName: string, price: number) => {
  trackEvent('add_to_cart', {
    product_id: productId,
    product_name: productName,
    price,
  });
};

export const trackPurchase = (orderId: string, total: number, items: any[]) => {
  trackEvent('purchase', {
    order_id: orderId,
    total,
    item_count: items.length,
  });
  trackConversion('purchase', total);
};

