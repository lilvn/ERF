'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface CartItem {
  id: string;
  variantId: string;
  title: string;
  variantTitle: string;
  price: string;
  quantity: number;
  image?: string;
}

interface Cart {
  id: string;
  items: CartItem[];
  checkoutUrl: string;
  totalQuantity: number;
  totalPrice: string;
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'erf-cart-id';

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const cartId = localStorage.getItem(CART_STORAGE_KEY);
    if (cartId) {
      fetchCart(cartId);
    }
  }, []);

  const fetchCart = async (cartId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get', cartId }),
      });
      
      if (!response.ok) {
        // Cart might be expired, clear it
        localStorage.removeItem(CART_STORAGE_KEY);
        return;
      }
      
      const data = await response.json();
      setCart(data.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  };

  const addToCart = useCallback(async (variantId: string, quantity: number = 1) => {
    setIsLoading(true);
    try {
      const cartId = localStorage.getItem(CART_STORAGE_KEY);
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          cartId,
          variantId,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      const data = await response.json();
      setCart(data.cart);
      localStorage.setItem(CART_STORAGE_KEY, data.cart.id);
      setIsCartOpen(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (lineId: string, quantity: number) => {
    if (!cart) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          cartId: cart.id,
          lineId,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart');
      }

      const data = await response.json();
      setCart(data.cart);
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [cart]);

  const removeFromCart = useCallback(async (lineId: string) => {
    if (!cart) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          cartId: cart.id,
          lineId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove from cart');
      }

      const data = await response.json();
      setCart(data.cart);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart(null);
    localStorage.removeItem(CART_STORAGE_KEY);
    setIsCartOpen(false);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
