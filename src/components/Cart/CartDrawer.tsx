'use client';

import React, { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { CartItem } from './CartItem';

export function CartDrawer() {
  const { cart, isCartOpen, closeCart, isLoading } = useCart();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    
    if (isCartOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const itemCount = cart?.totalQuantity || 0;
  const totalPrice = cart?.totalPrice ? parseFloat(cart.totalPrice).toFixed(2) : '0.00';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold tracking-wide">CART ({itemCount})</h2>
          <button 
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && !cart?.items.length && (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
            </div>
          )}
          
          {!isLoading && (!cart || cart.items.length === 0) && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm mt-1">Add some items to get started</p>
            </div>
          )}

          {cart && cart.items.length > 0 && (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total</span>
              <span className="text-2xl font-bold">${totalPrice}</span>
            </div>
            
            <a 
              href={cart.checkoutUrl}
              className="block w-full py-4 bg-black text-white text-center font-bold tracking-wide hover:bg-gray-800 transition-colors rounded-lg"
            >
              CHECKOUT
            </a>
            
            <button
              onClick={closeCart}
              className="block w-full py-3 border-2 border-black text-center font-medium hover:bg-gray-100 transition-colors rounded-lg"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
