'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Props {
  size: 'S' | 'M' | 'L';
  product: 'Hoodie' | 'Tee';
  isActive: boolean;
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;
  setIsScrolling: (isScrolling: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onRubberbandComplete?: () => void;
}

export const WedgieScroll = ({ 
  size, 
  product, 
  isActive, 
  scrollProgress,
  setScrollProgress,
  setIsScrolling,
  containerRef,
  onRubberbandComplete
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frames, setFrames] = useState<{ base: HTMLImageElement[]; product: HTMLImageElement[] }>({
    base: [],
    product: [],
  });
  const accumulatedScroll = useRef(0);
  const isScrollingActive = useRef(false);
  const isRubberbanding = useRef(false);
  const scrollEndTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Audio refs
  const stretchAudioRef = useRef<HTMLAudioElement | null>(null);
  const slapAudioRef = useRef<HTMLAudioElement | null>(null);
  const slapDuration = useRef(0.35); // Default, will be updated when audio loads

  // Initialize audio elements
  useEffect(() => {
    stretchAudioRef.current = new Audio('/Merch/Audio/Stretchlong.wav');
    stretchAudioRef.current.loop = true;
    
    slapAudioRef.current = new Audio('/Merch/Audio/Slap.wav');
    slapAudioRef.current.addEventListener('loadedmetadata', () => {
      if (slapAudioRef.current) {
        slapDuration.current = slapAudioRef.current.duration;
      }
    });

    return () => {
      if (stretchAudioRef.current) {
        stretchAudioRef.current.pause();
        stretchAudioRef.current = null;
      }
      if (slapAudioRef.current) {
        slapAudioRef.current.pause();
        slapAudioRef.current = null;
      }
    };
  }, []);

  // Preload images
  useEffect(() => {
    const loadImages = async () => {
      const baseImages: HTMLImageElement[] = [];
      const productImages: HTMLImageElement[] = [];
      const promises: Promise<void>[] = [];

      for (let i = 1; i <= 60; i++) {
        const frameNum = 20000 + i;
        const baseUrl = `/Merch/Wedgie/${size}_Base_Wedgie/${frameNum}.webp`;
        const productUrl = `/Merch/Wedgie/${size}_${product}_Wedgie/${frameNum}.webp`;

        const baseImg = new Image();
        const productImg = new Image();
        
        baseImg.src = baseUrl;
        productImg.src = productUrl;

        promises.push(new Promise((resolve) => { baseImg.onload = () => resolve(); }));
        promises.push(new Promise((resolve) => { productImg.onload = () => resolve(); }));

        baseImages.push(baseImg);
        productImages.push(productImg);
      }

      await Promise.all(promises);
      setFrames({ base: baseImages, product: productImages });
    };

    loadImages();
  }, [size, product]);

  // Render the current frame
  useEffect(() => {
    if (frames.base.length < 60 || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const frameIndex = Math.min(59, Math.max(0, Math.floor(scrollProgress * 59)));
    const baseImg = frames.base[frameIndex];
    const prodImg = frames.product[frameIndex];

    // Get actual image dimensions for proper aspect ratio
    if (baseImg && baseImg.naturalWidth && baseImg.naturalHeight) {
      canvasRef.current.width = baseImg.naturalWidth;
      canvasRef.current.height = baseImg.naturalHeight;
    }

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (baseImg) ctx.drawImage(baseImg, 0, 0, canvasRef.current.width, canvasRef.current.height);
    if (prodImg) ctx.drawImage(prodImg, 0, 0, canvasRef.current.width, canvasRef.current.height);
  }, [frames, scrollProgress]);

  // Handle wheel events on the container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (isRubberbanding.current) return;

      const wasScrolling = isScrollingActive.current;
      isScrollingActive.current = true;

      // Start stretch sound if we just started scrolling
      if (!wasScrolling && stretchAudioRef.current) {
        stretchAudioRef.current.currentTime = 0;
        stretchAudioRef.current.play().catch(() => {});
      }

      // Clear any pending scroll end detection
      if (scrollEndTimeout.current) {
        clearTimeout(scrollEndTimeout.current);
      }

      // Accumulate scroll
      accumulatedScroll.current += e.deltaY * 0.0022;
      accumulatedScroll.current = Math.max(0, Math.min(1, accumulatedScroll.current));

      setScrollProgress(accumulatedScroll.current);
      setIsScrolling(accumulatedScroll.current > 0);

      // If scroll returned to 0 or reached last frame, stop stretch sound
      if ((accumulatedScroll.current === 0 || accumulatedScroll.current >= 1) && stretchAudioRef.current) {
        stretchAudioRef.current.pause();
        if (accumulatedScroll.current === 0) {
          isScrollingActive.current = false;
        }
      }

      // Detect scroll end - if no wheel event for 150ms, consider scroll released
      scrollEndTimeout.current = setTimeout(() => {
        // Stop stretch sound
        if (stretchAudioRef.current) {
          stretchAudioRef.current.pause();
        }
        
        if (isScrollingActive.current && accumulatedScroll.current > 0 && !isRubberbanding.current) {
          triggerRubberband();
        }
      }, 150);
    };

    const triggerRubberband = () => {
      if (isRubberbanding.current) return;
      isRubberbanding.current = true;
      isScrollingActive.current = false;

      // Play slap sound
      if (slapAudioRef.current) {
        slapAudioRef.current.currentTime = 0;
        slapAudioRef.current.play().catch(() => {});
      }

      // Use slap audio duration for rubberband animation (cap at 0.25s for snappiness)
      const duration = Math.min(slapDuration.current, 0.25);
      const startProgress = accumulatedScroll.current;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = (currentTime - startTime) / 1000;
        const progress = Math.min(1, elapsed / duration);
        
        // Extra snappy ease out - power of 6 for aggressive snap
        const eased = 1 - Math.pow(1 - progress, 6);
        const currentProgress = startProgress * (1 - eased);

        accumulatedScroll.current = currentProgress;
        setScrollProgress(currentProgress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          accumulatedScroll.current = 0;
          setScrollProgress(0);
          setIsScrolling(false);
          isRubberbanding.current = false;
          onRubberbandComplete?.();
        }
      };

      requestAnimationFrame(animate);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (scrollEndTimeout.current) {
        clearTimeout(scrollEndTimeout.current);
      }
    };
  }, [containerRef, setScrollProgress, setIsScrolling, onRubberbandComplete]);

  return (
    <div className={`absolute inset-0 flex items-center justify-center ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{ transition: 'none' }}>
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
};
