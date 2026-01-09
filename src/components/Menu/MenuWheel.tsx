'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useAnaglyph } from '@/context/AnaglyphContext';

export type MenuItem = {
  name: string;
  path: string;
  icon: string;
};

export const MENU_ITEMS = [
  { name: 'MERCH', path: '/merch', icon: '/Menu/MenuWheel/MERCH.webp' },
  { name: 'GALLERIES', path: '/galleries', icon: '/Menu/MenuWheel/GALLERIES.webp' },
  { name: 'ACCOUNT', path: '/account', icon: '/Menu/MenuWheel/ACCOUNT.webp' },
  { name: 'STUDIOS', path: '/studios', icon: '/Menu/MenuWheel/STUDIOS.webp' },
  { name: 'WOODSHOP', path: '/woodshop', icon: '/Menu/MenuWheel/WOODSHOP.webp' },
  { name: 'CERAMICS', path: '/ceramics', icon: '/Menu/MenuWheel/CERAMICS.webp' },
  { name: 'CONTACT', path: '/contact', icon: '/Menu/MenuWheel/CONTACT.webp' },
  { name: 'EVENTS', path: '/events', icon: '/Menu/MenuWheel/EVENTS.webp' },
];

const MenuItem = ({ item, index, total, onClose, selectedItem, onItemClick }: { 
  item: MenuItem; 
  index: number; 
  total: number;
  onClose: (item: MenuItem) => void;
  selectedItem: MenuItem | null;
  onItemClick: (item: MenuItem) => void;
}) => {
  const { getCombinedStyle } = useAnaglyph();
  const itemRef = useRef<HTMLDivElement>(null);
  const angle = (index / total) * Math.PI * 2;
  const radius = 280;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  const isSelected = selectedItem?.name === item.name;

  // Calculate the target position for animation to top-left
  const getExitAnimation = () => {
    if (isSelected) {
      // Animate to top-left corner
      // Current position is center of screen + offset, target is top-left
      const currentX = window.innerWidth / 2 + x - 80;
      const currentY = window.innerHeight / 2 + y - 80;
      const targetX = 24;
      const targetY = 24;
      
      return {
        x: targetX - currentX,
        y: targetY - currentY,
        scale: 0.5,
        opacity: 1,
      };
    }
    // Non-selected items fade out
    return { opacity: 0, scale: 0 };
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onItemClick(item);
    // Small delay to let the exit animation start before navigation
    setTimeout(() => {
      onClose(item);
    }, 50);
  };

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={getExitAnimation()}
      transition={{ 
        duration: isSelected ? 0.4 : 0.15,
        ease: isSelected ? [0.4, 0, 0.2, 1] : [0.34, 1.56, 0.64, 1]
      }}
      style={{ 
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: x - 80,
        marginTop: y - 80,
        ...getCombinedStyle('foreground'),
      }}
      className="pointer-events-auto"
    >
      <Link href={item.path} onClick={handleClick}>
        <div className="relative w-40 h-40 hover:scale-110 transition-transform">
          <Image
            src={item.icon}
            alt={item.name}
            fill
            className="object-contain"
            unoptimized
            priority
          />
        </div>
      </Link>
    </motion.div>
  );
};

export const MenuWheel = ({ isOpen, onClose }: { isOpen: boolean; onClose: (item?: MenuItem) => void }) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Reset selected item when menu opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedItem(null);
    }
  }, [isOpen]);

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <AnimatePresence>
        {isOpen && MENU_ITEMS.map((item, index) => (
          <MenuItem 
            key={item.name} 
            item={item} 
            index={index} 
            total={MENU_ITEMS.length}
            onClose={onClose}
            selectedItem={selectedItem}
            onItemClick={handleItemClick}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

