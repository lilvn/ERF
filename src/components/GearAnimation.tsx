'use client';

import React, { useEffect, useRef, useState } from 'react';

interface GearAnimationProps {
  isOpen: boolean;
  onClick: () => void;
}

const TOTAL_FRAMES = 20;
const ANIMATION_DURATION = 200; // milliseconds to match menu animation

export const GearAnimation: React.FC<GearAnimationProps> = ({ isOpen, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frames, setFrames] = useState<HTMLImageElement[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationRef = useRef<number | null>(null);
  const previousIsOpen = useRef<boolean | null>(null);
  const currentFrameRef = useRef(0);

  // Preload all frames
  useEffect(() => {
    const loadFrames = async () => {
      const images: HTMLImageElement[] = [];
      const promises: Promise<void>[] = [];

      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const frameNum = 20000 + i;
        const img = new Image();
        img.src = `/Menu/Gear_Animation/${frameNum}.webp`;
        
        promises.push(
          new Promise((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Continue even if frame fails to load
          })
        );
        
        images.push(img);
      }

      await Promise.all(promises);
      setFrames(images);
    };

    loadFrames();
  }, []);

  // Render current frame to canvas
  useEffect(() => {
    if (frames.length < TOTAL_FRAMES || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = frames[currentFrame];
    if (img && img.naturalWidth && img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    
    currentFrameRef.current = currentFrame;
  }, [frames, currentFrame]);

  // Animate frames when isOpen changes
  useEffect(() => {
    // Skip if frames aren't loaded
    if (frames.length < TOTAL_FRAMES) {
      return;
    }

    // Skip if state hasn't changed
    if (previousIsOpen.current === isOpen) {
      return;
    }

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startFrame = currentFrameRef.current;
    const targetFrame = isOpen ? TOTAL_FRAMES - 1 : 0;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      
      // Ease out animation
      const eased = 1 - Math.pow(1 - progress, 3);
      
      // Calculate frame based on direction
      let newFrame: number;
      if (isOpen) {
        // Forward: animate from current to last frame
        newFrame = Math.floor(startFrame + (targetFrame - startFrame) * eased);
      } else {
        // Reverse: animate from current to first frame
        newFrame = Math.floor(startFrame - startFrame * eased);
      }
      
      setCurrentFrame(Math.max(0, Math.min(TOTAL_FRAMES - 1, newFrame)));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentFrame(targetFrame);
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    previousIsOpen.current = isOpen;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, frames.length]);

  return (
    <div 
      className="relative w-16 h-16 cursor-pointer"
      onClick={onClick}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
};
