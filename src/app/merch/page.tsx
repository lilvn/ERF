'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { WebPLayeredRenderer } from '@/components/Merch/WebPLayeredRenderer';
import { WedgieScroll } from '@/components/Merch/WedgieScroll';
import Image from 'next/image';

export default function MerchPage() {
  const [size, setSize] = useState<'S' | 'M' | 'L'>('M');
  const [product, setProduct] = useState<'Hoodie' | 'Tee'>('Hoodie');
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile vs desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSizeChange = (newSize: 'S' | 'M' | 'L') => {
    setSize(newSize);
    setAnimationKey(prev => prev + 1);
    setScrollProgress(0);
    setIsScrolling(false);
  };

  const handleProductChange = (newProduct: 'Hoodie' | 'Tee') => {
    setProduct(newProduct);
    setAnimationKey(prev => prev + 1);
    setScrollProgress(0);
    setIsScrolling(false);
  };

  const handleRubberbandComplete = useCallback(() => {
    setAnimationKey(prev => prev + 1);
  }, []);

  // Shared Merch Viewer
  const MerchViewer = (
    <div 
      ref={containerRef} 
      className="relative cursor-ns-resize flex-shrink-0"
      style={{ 
        width: isMobile ? 'min(70vw, 320px)' : 'min(35vw, 500px)', 
        height: isMobile ? 'min(90vw, 420px)' : 'min(50vw, 700px)'
      }}
    >
      <WebPLayeredRenderer 
        key={animationKey} 
        size={size} 
        product={product} 
        isScrolling={isScrolling}
        cacheBuster={animationKey}
      />
      <WedgieScroll 
        size={size} 
        product={product} 
        isActive={isScrolling}
        scrollProgress={scrollProgress}
        setScrollProgress={setScrollProgress}
        setIsScrolling={setIsScrolling}
        containerRef={containerRef}
        onRubberbandComplete={handleRubberbandComplete}
      />
    </div>
  );

  // Show nothing until we know if mobile or not (prevents flash)
  if (isMobile === null) {
    return <div className="h-screen bg-white" />;
  }

  if (isMobile) {
    return (
      <div className="h-screen overflow-hidden bg-white text-black animate-fade-in">
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="flex-shrink-0 pt-4 pb-2">
            <h1 className="text-2xl font-bold text-center tracking-wide">ERF MERCH</h1>
          </header>

          {/* Character Viewer with Size Selector */}
          <div className="flex-1 flex items-center justify-center px-4 min-h-0">
            <div className="flex items-center gap-6">
              {MerchViewer}

              {/* Size Selector - Right side of character */}
              <div className="flex flex-col gap-6">
                {(['S', 'M', 'L'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSizeChange(s)}
                    className={`text-2xl font-light transition-all duration-200 cursor-pointer ${
                      size === s 
                        ? 'font-bold text-black scale-110' 
                        : 'text-gray-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Selector - Above logo button, moved much higher */}
          <div className="flex-shrink-0 flex justify-center gap-8 pb-48 relative z-10">
            <button 
              onClick={() => handleProductChange('Hoodie')}
              className={`relative transition-all duration-200 cursor-pointer ${
                product === 'Hoodie' 
                  ? 'opacity-100' 
                  : 'opacity-40 grayscale'
              }`}
            >
              <div className="w-20 h-20 relative">
                <Image 
                  src="/Merch/Product Selector/Hoodie.png" 
                  alt="Hoodie" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <p className={`mt-1 text-xs text-center ${
                product === 'Hoodie' 
                  ? 'text-indigo-600 underline underline-offset-2' 
                  : 'text-gray-400'
              }`}>
                Hoodie
              </p>
            </button>
            
            <button 
              onClick={() => handleProductChange('Tee')}
              className={`relative transition-all duration-200 cursor-pointer ${
                product === 'Tee' 
                  ? 'opacity-100' 
                  : 'opacity-40 grayscale'
              }`}
            >
              <div className="w-20 h-20 relative">
                <Image 
                  src="/Merch/Product Selector/Tshirt.png" 
                  alt="Tee" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <p className={`mt-1 text-xs text-center ${
                product === 'Tee' 
                  ? 'text-indigo-600 underline underline-offset-2' 
                  : 'text-gray-400'
              }`}>
                Tee
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-screen overflow-hidden bg-white text-black animate-fade-in">
      {/* Title at top center */}
      <header className="absolute top-0 left-0 right-0 pt-6 z-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-center">ERF MERCH</h1>
      </header>

      <div className="flex h-full pt-16">
        {/* Left Side: Character */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          {MerchViewer}
        </div>

        {/* Right Side: Selectors */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 gap-6 lg:gap-12 mt-8 relative z-10">
          {/* Product Selector - Responsive sizing, moved slightly lower */}
          <div className="flex gap-4 lg:gap-10 items-end flex-shrink-0 mt-4">
            <button 
              onClick={() => handleProductChange('Hoodie')}
              className={`relative transition-all duration-200 cursor-pointer ${
                product === 'Hoodie' 
                  ? 'opacity-100' 
                  : 'opacity-40 grayscale hover:opacity-60'
              }`}
            >
              <div 
                className="relative"
                style={{ width: 'min(15vw, 180px)', height: 'min(15vw, 180px)' }}
              >
                <Image src="/Merch/Product Selector/Hoodie.png" alt="Hoodie" fill className="object-contain" />
              </div>
              <p className={`mt-2 text-center text-sm lg:text-base ${
                product === 'Hoodie' 
                  ? 'text-indigo-600 underline underline-offset-2' 
                  : 'text-gray-400'
              }`}>Hoodie</p>
            </button>
            <button 
              onClick={() => handleProductChange('Tee')}
              className={`relative transition-all duration-200 cursor-pointer ${
                product === 'Tee' 
                  ? 'opacity-100' 
                  : 'opacity-40 grayscale hover:opacity-60'
              }`}
            >
              <div 
                className="relative"
                style={{ width: 'min(15vw, 180px)', height: 'min(15vw, 180px)' }}
              >
                <Image src="/Merch/Product Selector/Tshirt.png" alt="Tee" fill className="object-contain" />
              </div>
              <p className={`mt-2 text-center text-sm lg:text-base ${
                product === 'Tee' 
                  ? 'text-indigo-600 underline underline-offset-2' 
                  : 'text-gray-400'
              }`}>Tee</p>
            </button>
          </div>

          {/* Size Selector - Responsive sizing with better click targets */}
          <div className="flex gap-2 lg:gap-6 font-light flex-shrink-0" style={{ fontSize: 'min(5vw, 2.25rem)' }}>
            {(['S', 'M', 'L'] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleSizeChange(s)}
                className={`transition-all duration-200 cursor-pointer px-4 py-2 ${
                  size === s 
                    ? 'font-bold scale-125 text-black' 
                    : 'text-gray-300 hover:text-gray-500'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

