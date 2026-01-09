'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';

export function CartButton() {
  const { cart, toggleCart, isLoading } = useCart();
  
  const itemCount = cart?.totalQuantity || 0;

  return (
    <button
      onClick={toggleCart}
      disabled={isLoading}
      className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-black text-white px-5 py-3 rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-105 disabled:opacity-50"
      aria-label={`Open cart with ${itemCount} items`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      <span className="font-bold tracking-wide">CART</span>
      {itemCount > 0 && (
        <span className="bg-white text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}
