'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { WebPLayeredRenderer } from '@/components/Merch/WebPLayeredRenderer';
import { WedgieScroll } from '@/components/Merch/WedgieScroll';
import { useAnaglyph } from '@/context/AnaglyphContext';
import { useCart } from '@/context/CartContext';
import { CartDrawer, CartButton } from '@/components/Cart';
/* eslint-disable @next/next/no-img-element */

interface ProductVariant {
  id: string;
  title: string;
  price: string;
  availableForSale: boolean;
}

interface Product {
  id: string;
  title: string;
  description: string;
  handle: string;
  productType: string;
  images: string[];
  variants: ProductVariant[];
  priceRange: {
    min: string;
    max: string;
  };
}

type ProductType = 'Hoodie' | 'Tee';
type SizeType = 'S' | 'M' | 'L';

export default function MerchPage() {
  const [size, setSize] = useState<SizeType>('M');
  const [product, setProduct] = useState<ProductType>('Hoodie');
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { getCombinedStyle } = useAnaglyph();
  const { addToCart } = useCart();

  // Fetch products from Shopify
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Find the current product and variant
  const currentProduct = products.find(p => 
    p.title.toLowerCase().includes(product.toLowerCase()) ||
    p.productType.toLowerCase().includes(product.toLowerCase())
  );

  const currentVariant = currentProduct?.variants.find(v => 
    v.title.toLowerCase().includes(size.toLowerCase()) ||
    v.title === size
  ) || currentProduct?.variants[0];

  // Detect mobile vs desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSizeChange = (newSize: SizeType) => {
    setSize(newSize);
    setAnimationKey(prev => prev + 1);
    setScrollProgress(0);
    setIsScrolling(false);
  };

  const handleProductChange = (newProduct: ProductType) => {
    setProduct(newProduct);
    setAnimationKey(prev => prev + 1);
    setScrollProgress(0);
    setIsScrolling(false);
  };

  const handleAddToCart = async () => {
    if (!currentVariant || !currentVariant.availableForSale) return;
    
    setIsAddingToCart(true);
    try {
      await addToCart(currentVariant.id);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleRubberbandComplete = useCallback(() => {
    setAnimationKey(prev => prev + 1);
  }, []);

  // Get product image from Shopify or fallback
  const getProductImage = (productType: ProductType) => {
    const prod = products.find(p => 
      p.title.toLowerCase().includes(productType.toLowerCase()) ||
      p.productType.toLowerCase().includes(productType.toLowerCase())
    );
    return prod?.images[0];
  };

  const hoodieImage = getProductImage('Hoodie');
  const teeImage = getProductImage('Tee');

  // Get price display
  const priceDisplay = currentVariant 
    ? `$${parseFloat(currentVariant.price).toFixed(2)}`
    : currentProduct 
      ? `$${parseFloat(currentProduct.priceRange.min).toFixed(2)}`
      : '';

  // Shared Merch Viewer
  const MerchViewer = (
    <div 
      ref={containerRef} 
      className="relative cursor-ns-resize flex-shrink-0"
      style={{ 
        width: isMobile ? 'min(70vw, 320px)' : 'min(35vw, 500px)', 
        height: isMobile ? 'min(90vw, 420px)' : 'min(50vw, 700px)',
        ...getCombinedStyle('middleground')
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

  // Product selector button component
  const ProductButton = ({ 
    productType, 
    image, 
    fallbackSrc 
  }: { 
    productType: ProductType; 
    image?: string;
    fallbackSrc: string;
  }) => (
    <button 
      onClick={() => handleProductChange(productType)}
      className={`relative transition-all duration-200 cursor-pointer ${
        product === productType 
          ? 'opacity-100' 
          : 'opacity-40 grayscale hover:opacity-60'
      }`}
      style={getCombinedStyle(product === productType ? 'foreground' : 'background')}
    >
      <div 
        className="relative bg-gray-50 rounded-lg overflow-hidden"
        style={{ width: isMobile ? '80px' : 'min(15vw, 180px)', height: isMobile ? '80px' : 'min(15vw, 180px)' }}
      >
        {isLoadingProducts ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          </div>
        ) : (
          <img 
            src={image || fallbackSrc} 
            alt={productType}
            className="w-full h-full object-contain p-2"
          />
        )}
      </div>
      <p className={`mt-2 text-center text-sm lg:text-base ${
        product === productType 
          ? 'text-indigo-600 underline underline-offset-2' 
          : 'text-gray-400'
      }`}>{productType}</p>
    </button>
  );

  // Add to cart button
  const AddToCartButton = () => (
    <button
      onClick={handleAddToCart}
      disabled={isAddingToCart || !currentVariant?.availableForSale}
      className={`mt-4 px-8 py-3 font-bold tracking-wide rounded-lg transition-all duration-200 ${
        currentVariant?.availableForSale
          ? 'bg-black text-white hover:bg-gray-800 hover:scale-105'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
    >
      {isAddingToCart ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Adding...
        </span>
      ) : !currentVariant?.availableForSale ? (
        'Out of Stock'
      ) : (
        `Add to Cart ${priceDisplay}`
      )}
    </button>
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
            <h1 className="text-2xl font-bold text-center tracking-wide">MERCH</h1>
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

          {/* Product Selector */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4 pb-32 relative z-10">
            <div className="flex justify-center gap-8">
              <ProductButton 
                productType="Hoodie" 
                image={hoodieImage}
                fallbackSrc="/Merch/Product Selector/Hoodie.png"
              />
              <ProductButton 
                productType="Tee" 
                image={teeImage}
                fallbackSrc="/Merch/Product Selector/Tshirt.png"
              />
            </div>
            <AddToCartButton />
          </div>
        </div>
        
        <CartDrawer />
        <CartButton />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-screen overflow-hidden bg-white text-black animate-fade-in">
      {/* Title at top center */}
      <header className="absolute top-0 left-0 right-0 pt-20 z-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-center">MERCH</h1>
      </header>

      <div className="flex h-full pt-16">
        {/* Left Side: Character */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          {MerchViewer}
        </div>

        {/* Right Side: Selectors */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 gap-6 lg:gap-8 mt-8 relative z-10">
          {/* Product Selector */}
          <div className="flex gap-4 lg:gap-10 items-end flex-shrink-0 mt-4">
            <ProductButton 
              productType="Hoodie" 
              image={hoodieImage}
              fallbackSrc="/Merch/Product Selector/Hoodie.png"
            />
            <ProductButton 
              productType="Tee" 
              image={teeImage}
              fallbackSrc="/Merch/Product Selector/Tshirt.png"
            />
          </div>

          {/* Size Selector */}
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

          {/* Add to Cart Button */}
          <AddToCartButton />
        </div>
      </div>

      <CartDrawer />
      <CartButton />
    </div>
  );
}
