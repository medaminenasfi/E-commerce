import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Cart, CartItem } from '../types';

interface CartContextType {
  cart: Cart | null;
  addItem: (item: Omit<CartItem, 'total'>) => void;
  updateQuantity: (productId: string, variantSku: string, quantity: number) => void;
  removeItem: (productId: string, variantSku: string) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('guestCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing saved cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart) {
      localStorage.setItem('guestCart', JSON.stringify(cart));
    }
  }, [cart]);

  const addItem = (item: Omit<CartItem, 'total'>) => {
    const newItem: CartItem = {
      ...item,
      total: item.price * item.quantity,
    };

    setCart((prevCart) => {
      if (!prevCart) {
        return {
          _id: 'guest',
          items: [newItem],
          subtotal: newItem.total,
          total: newItem.total,
          couponCode: undefined,
          couponDiscount: 0,
          itemCount: 1,
        };
      }

      const existingItemIndex = prevCart.items.findIndex(
        (cartItem) => cartItem.productId === item.productId && cartItem.variantSku === item.variantSku
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex].quantity += item.quantity;
        updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].price * updatedItems[existingItemIndex].quantity;

        const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
        return {
          ...prevCart,
          items: updatedItems,
          subtotal,
          total: subtotal - prevCart.couponDiscount,
          itemCount: updatedItems.length,
        };
      } else {
        const newItems = [...prevCart.items, newItem];
        const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
        return {
          ...prevCart,
          items: newItems,
          subtotal,
          total: subtotal - prevCart.couponDiscount,
          itemCount: newItems.length,
        };
      }
    });
  };

  const updateQuantity = (productId: string, variantSku: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, variantSku);
      return;
    }

    setCart((prevCart) => {
      if (!prevCart) return null;

      const updatedItems = prevCart.items.map((item) =>
        item.productId === productId && item.variantSku === variantSku
          ? { ...item, quantity, total: item.price * quantity }
          : item
      );

      const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
      return {
        ...prevCart,
        items: updatedItems,
        subtotal,
        total: subtotal - prevCart.couponDiscount,
        itemCount: updatedItems.length,
      };
    });
  };

  const removeItem = (productId: string, variantSku: string) => {
    setCart((prevCart) => {
      if (!prevCart) return null;

      const updatedItems = prevCart.items.filter(
        (item) => !(item.productId === productId && item.variantSku === variantSku)
      );

      const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
      return {
        ...prevCart,
        items: updatedItems,
        subtotal,
        total: subtotal - prevCart.couponDiscount,
        itemCount: updatedItems.length,
      };
    });
  };

  const clearCart = () => {
    setCart(null);
    localStorage.removeItem('guestCart');
  };

  const value: CartContextType = {
    cart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    itemCount: cart?.itemCount || 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
