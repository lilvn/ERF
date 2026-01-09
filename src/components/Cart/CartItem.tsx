'use client';

import React from 'react';
import { useCart, CartItem as CartItemType } from '@/context/CartContext';
/* eslint-disable @next/next/no-img-element */

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart, isLoading } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  const price = parseFloat(item.price).toFixed(2);
  const lineTotal = (parseFloat(item.price) * item.quantity).toFixed(2);

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Product Image */}
      {item.image && (
        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={item.image} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm truncate">{item.title}</h3>
        {item.variantTitle && item.variantTitle !== 'Default Title' && (
          <p className="text-xs text-gray-500 mt-0.5">{item.variantTitle}</p>
        )}
        <p className="text-sm text-gray-700 mt-1">${price}</p>
        
        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isLoading}
            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Decrease quantity"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
          
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isLoading}
            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Increase quantity"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Line Total & Remove */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeFromCart(item.id)}
          disabled={isLoading}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          aria-label="Remove item"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <span className="font-bold text-sm">${lineTotal}</span>
      </div>
    </div>
  );
}
