'use client';

import React, { createContext, useContext, useState } from 'react';

interface AnaglyphContextType {
  anaglyphEnabled: boolean;
  setAnaglyphEnabled: (enabled: boolean) => void;
  bitmapEnabled: boolean;
  setBitmapEnabled: (enabled: boolean) => void;
  gameBoyEnabled: boolean;
  setGameBoyEnabled: (enabled: boolean) => void;
  activeFilter: 'none' | 'anaglyph' | 'bitmap' | 'gameboy';
  setActiveFilter: (filter: 'none' | 'anaglyph' | 'bitmap' | 'gameboy') => void;
  getDepthStyle: (depth: 'background' | 'middleground' | 'foreground') => React.CSSProperties;
  getBitmapStyle: () => React.CSSProperties;
  getCombinedStyle: (depth?: 'background' | 'middleground' | 'foreground') => React.CSSProperties;
}

const AnaglyphContext = createContext<AnaglyphContextType | undefined>(undefined);

const DEPTH_VALUES = {
  background: 8,    // Logo when menu is open - furthest back
  middleground: 4,  // Logo when menu is closed - middle depth
  foreground: 2,    // Menu wheel items - closest
};

export const AnaglyphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeFilter, setActiveFilter] = useState<'none' | 'anaglyph' | 'bitmap' | 'gameboy'>('none');
  
  // Derived states for backward compatibility
  const anaglyphEnabled = activeFilter === 'anaglyph';
  const bitmapEnabled = activeFilter === 'bitmap';
  const gameBoyEnabled = activeFilter === 'gameboy';

  const setAnaglyphEnabled = (enabled: boolean) => {
    setActiveFilter(enabled ? 'anaglyph' : 'none');
  };

  const setBitmapEnabled = (enabled: boolean) => {
    setActiveFilter(enabled ? 'bitmap' : 'none');
  };

  const setGameBoyEnabled = (enabled: boolean) => {
    setActiveFilter(enabled ? 'gameboy' : 'none');
  };

  const getDepthStyle = (depth: 'background' | 'middleground' | 'foreground'): React.CSSProperties => {
    if (!anaglyphEnabled) {
      return {};
    }

    const offset = DEPTH_VALUES[depth];
    
    return {
      filter: `
        drop-shadow(${offset}px 0 0 rgba(0, 255, 255, 0.7))
        drop-shadow(-${offset}px 0 0 rgba(255, 0, 0, 0.7))
      `.trim(),
    };
  };

  const getBitmapStyle = (): React.CSSProperties => {
    if (!bitmapEnabled) {
      return {};
    }

    return {
      imageRendering: 'pixelated',
    };
  };

  const getCombinedStyle = (depth?: 'background' | 'middleground' | 'foreground'): React.CSSProperties => {
    const filters: string[] = [];
    
    if (anaglyphEnabled && depth) {
      const offset = DEPTH_VALUES[depth];
      filters.push(`drop-shadow(${offset}px 0 0 rgba(0, 255, 255, 0.7))`);
      filters.push(`drop-shadow(-${offset}px 0 0 rgba(255, 0, 0, 0.7))`);
    }
    
    if (bitmapEnabled) {
      filters.push('url(#bitmap)');
    }

    if (gameBoyEnabled) {
      filters.push('url(#gameboy)');
    }

    return filters.length > 0 ? { filter: filters.join(' ') } : {};
  };

  return (
    <AnaglyphContext.Provider value={{ 
      anaglyphEnabled, 
      setAnaglyphEnabled,
      bitmapEnabled,
      setBitmapEnabled,
      gameBoyEnabled,
      setGameBoyEnabled,
      activeFilter,
      setActiveFilter,
      getDepthStyle,
      getBitmapStyle,
      getCombinedStyle
    }}>
      {children}
    </AnaglyphContext.Provider>
  );
};

export const useAnaglyph = () => {
  const context = useContext(AnaglyphContext);
  if (!context) throw new Error('useAnaglyph must be used within AnaglyphProvider');
  return context;
};

