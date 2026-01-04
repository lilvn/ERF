'use client';

import React from 'react';
/* eslint-disable @next/next/no-img-element */

interface Props {
  size: 'S' | 'M' | 'L';
  product: 'Hoodie' | 'Tee';
  isScrolling: boolean;
  cacheBuster: number;
}

export const WebPLayeredRenderer = ({ size, product, isScrolling, cacheBuster }: Props) => {
  // Cache buster forces browser to reload animated WebPs from scratch
  const baseSrc = `/Merch/Idle/${size}_Base_Idle.webp?v=${cacheBuster}`;
  const productSrc = `/Merch/Idle/${size}_${product}_Idle.webp?v=${cacheBuster}`;

  return (
    <div className={`absolute inset-0 ${isScrolling ? 'opacity-0' : 'opacity-100'}`} style={{ transition: 'none' }}>
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Base Model */}
        <img
          src={baseSrc}
          alt="Base Model"
          className="absolute max-w-full max-h-full object-contain"
        />
        {/* Clothing Layer */}
        <img
          src={productSrc}
          alt={product}
          className="absolute max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
};

