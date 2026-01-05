'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { MenuWheel } from './MenuWheel';
import { useAnaglyph } from '@/context/AnaglyphContext';
import gsap from 'gsap';

export const Menu = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [spinTrigger, setSpinTrigger] = useState(0);
  const [spinDirection, setSpinDirection] = useState<'open' | 'close'>('open');
  const [targetPage, setTargetPage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';
  const isInitialMount = useRef(true);
  const { getCombinedStyle } = useAnaglyph();

  // Blur background and reduce opacity when menu is expanded
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) {
      if (isExpanded) {
        main.style.filter = 'blur(20px)';
        main.style.opacity = '0.5';
      } else {
        main.style.filter = 'none';
        main.style.opacity = '1';
      }
      main.style.transition = 'filter 0.5s ease, opacity 0.5s ease';
    }
  }, [isExpanded]);

  // Handle position animation based on navigation intent
  useEffect(() => {
    if (!containerRef.current) return;

    // Determine where we should be based on intent
    let shouldCenter: boolean;
    
    if (targetPage !== null) {
      // We're navigating - use the target to decide
      shouldCenter = isExpanded || targetPage === '/';
    } else {
      // Not navigating - use current state
      shouldCenter = isExpanded || isHome;
    }

    const targetY = shouldCenter ? 0 : window.innerHeight / 2 - 80;

    if (isInitialMount.current) {
      gsap.set(containerRef.current, { y: targetY });
      isInitialMount.current = false;
      return;
    }

    gsap.to(containerRef.current, {
      y: targetY,
      duration: 0.5,
      ease: 'power2.out'
    });
  }, [isHome, isExpanded, targetPage]);

  // Clear target page after navigation completes
  useEffect(() => {
    if (targetPage && pathname === targetPage) {
      // Use timeout to avoid setState in effect body
      const timer = setTimeout(() => setTargetPage(null), 0);
      return () => clearTimeout(timer);
    }
  }, [pathname, targetPage]);

  const handleLogoClick = () => {
    if (isExpanded) {
      setSpinDirection('close');
      setSpinTrigger(prev => prev + 1);
      setTargetPage('/');
      setIsExpanded(false);
      router.push('/');
    } else {
      setSpinDirection('open');
      setSpinTrigger(prev => prev + 1);
      setIsExpanded(true);
    }
  };

  const handleMenuClose = (path?: string) => {
    setSpinDirection('close');
    setSpinTrigger(prev => prev + 1);
    if (path) {
      setTargetPage(path);
    }
    setIsExpanded(false);
  };

  const handleOverlayClick = () => {
    setSpinDirection('close');
    setSpinTrigger(prev => prev + 1);
    setIsExpanded(false);
  };

  // Determine logo scale based on state and intent
  const getLogoScale = () => {
    if (isExpanded) {
      return 0.25;
    }
    
    // Use target page for scale if navigating
    const effectiveIsHome = targetPage !== null ? targetPage === '/' : isHome;
    
    if (effectiveIsHome) {
      return 0.35;
    }
    return 0.12;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[500]">
      {/* Overlay to catch clicks and close menu */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleOverlayClick}
            className="fixed inset-0 bg-transparent pointer-events-auto"
            style={{ zIndex: 101 }}
          />
        )}
      </AnimatePresence>

      {/* Menu Wheel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 103 }}
          >
            <MenuWheel isOpen={isExpanded} onClose={handleMenuClose} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo Container - GSAP handles position */}
      <div 
        ref={containerRef}
        className="fixed left-1/2 top-1/2 pointer-events-none"
        style={{ 
          zIndex: 200,
          marginLeft: '-250px',
          marginTop: '-250px',
          ...getCombinedStyle(isExpanded ? 'background' : 'foreground'),
        }}
      >
        {/* Canvas renders full size but pointer-events are disabled */}
        <div className="w-[500px] h-[500px] relative">
          <Canvas 
            camera={{ position: [0, 0, 5], fov: 25 }}
            style={{ pointerEvents: 'none' }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
            <Logo 
              onClick={handleLogoClick} 
              scale={getLogoScale()}
              shouldSpin={spinTrigger}
              spinDirection={spinDirection}
            />
            <Environment preset="city" />
          </Canvas>
          
          {/* Clickable hitbox overlay - sized based on logo state */}
          <div 
            onClick={handleLogoClick}
            className="absolute cursor-pointer pointer-events-auto"
            style={{
              width: isExpanded || isHome ? '200px' : '100px',
              height: isExpanded || isHome ? '200px' : '100px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              // Debug: uncomment to see hitbox
              // backgroundColor: 'rgba(255,0,0,0.2)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

