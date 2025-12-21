import { useCartStore } from '@/stores/cartStore';
import { Product } from '@/services/productService';

export const useCart = () => {
  const {
    items,
    appliedCoupon,
    discountAmount,
    addItem: addItemToStore,
    removeItem: removeItemFromStore,
    updateQuantity: updateQuantityInStore,
    clearCart: clearCartFromStore,
    applyCoupon: applyCouponToStore,
    removeCoupon: removeCouponFromStore,
    getSubtotal,
    getTotal,
    getItemCount,
  } = useCartStore();

  const addItem = (product: Product, size: string, quantity: number = 1) => {
    addItemToStore({
      id: product.id,
      name: product.name,
      price: product.price,
      size,
      quantity,
      image: product.images[0] || '',
      category: product.category,
    });
  };

  const removeItem = (productId: string, size: string) => {
    removeItemFromStore(productId, size);
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    updateQuantityInStore(productId, size, quantity);
  };

  const clearCart = () => {
    clearCartFromStore();
  };

  const applyCoupon = (code: string, discount: number) => {
    applyCouponToStore(code, discount);
  };

  const removeCoupon = () => {
    removeCouponFromStore();
  };

  return {
    items,
    appliedCoupon,
    discountAmount,
    subtotal: getSubtotal(),
    total: getTotal(),
    itemCount: getItemCount(),
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
  };
};

