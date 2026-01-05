'use client';

import { useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

export const Preloader = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const preloadAssets = async () => {
      // Preload 3D models
      const models = ['/Menu/Logo_MenuBtn.glb'];
      
      // Preload menu wheel images
      const menuImages = [
        '/Menu/MenuWheel/MERCH.webp',
        '/Menu/MenuWheel/GALLERIES.webp',
        '/Menu/MenuWheel/EVENTS.webp',
        '/Menu/MenuWheel/STUDIOS.webp',
        '/Menu/MenuWheel/WOODSHOP.webp',
        '/Menu/MenuWheel/CERAMICS.webp',
        '/Menu/MenuWheel/CONTACT.webp',
        '/Menu/MenuWheel/ACCOUNT.webp',
      ];

      // Preload gear animation frames
      const gearFrames = Array.from({ length: 20 }, (_, i) => 
        `/Menu/Gear_Animation/${20001 + i}.webp`
      );

      const allImages = [...menuImages, ...gearFrames];

      // Load all images
      const imagePromises = allImages.map(src => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = resolve; // Continue even if fails
        });
      });

      // Load 3D models
      models.forEach(model => {
        useGLTF.preload(model);
      });

      // Wait for all images
      await Promise.all(imagePromises);
      
      // Small delay to ensure everything is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setIsReady(true);
    };

    preloadAssets();
  }, []);

  if (!isReady) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">ERF NYC</div>
          <div className="animate-pulse text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

