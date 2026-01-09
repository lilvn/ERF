'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAnaglyph } from '@/context/AnaglyphContext';
import { GearAnimation } from './GearAnimation';
import { motion, AnimatePresence } from 'framer-motion';

export const DevControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeFilter, setActiveFilter } = useAnaglyph();
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Only show on homepage
  if (pathname !== '/') {
    return null;
  }

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-auto" ref={panelRef}>
      <div className="flex flex-col items-end gap-2">
        {/* Gear Button - Always visible */}
        <div>
          <GearAnimation isOpen={isOpen} onClick={handleToggle} />
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-300 min-w-[200px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-black text-sm font-bold">Customize</h3>
                  <button
                    onClick={handleClose}
                    className="text-gray-600 hover:text-black text-xl leading-none w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
                
                <div className="flex flex-col gap-2">
                  {/* None (Off) */}
                  <button
                    onClick={() => setActiveFilter('none')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      activeFilter === 'none'
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-black hover:bg-gray-300'
                    }`}
                  >
                    None
                  </button>

                  {/* Anaglyph Toggle */}
                  <button
                    onClick={() => setActiveFilter('anaglyph')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      activeFilter === 'anaglyph'
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-black hover:bg-gray-300'
                    }`}
                  >
                    Anaglyph 3D
                  </button>

                  {/* Bitmap Toggle */}
                  <button
                    onClick={() => setActiveFilter('bitmap')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      activeFilter === 'bitmap'
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-black hover:bg-gray-300'
                    }`}
                  >
                    Bitmap
                  </button>

                  {/* Game Boy Toggle */}
                  <button
                    onClick={() => setActiveFilter('gameboy')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      activeFilter === 'gameboy'
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-black hover:bg-gray-300'
                    }`}
                  >
                    Game Boy
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

