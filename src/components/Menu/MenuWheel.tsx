'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
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

// Calculate wheel position for a given index
export const getWheelPosition = (index: number, total: number) => {
  const angle = (index / total) * Math.PI * 2;
  const radius = 280;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return { x, y };
};

const MenuItem = ({ item, index, total, onClose, selectedItem, onItemClick }: { 
  item: MenuItem; 
  index: number; 
  total: number;
  onClose: (item: MenuItem, index: number) => void;
  selectedItem: MenuItem | null;
  onItemClick: (item: MenuItem) => void;
}) => {
  const { getCombinedStyle } = useAnaglyph();
  const { x, y } = getWheelPosition(index, total);

  const isSelected = selectedItem?.name === item.name;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onItemClick(item);
    // Small delay to let the state update
    setTimeout(() => {
      onClose(item, index);
    }, 50);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ 
        duration: 0.15,
        ease: [0.34, 1.56, 0.64, 1]
      }}
      style={{ 
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: x - 80,
        marginTop: y - 80,
        // Hide the selected item since we'll render a traveling version
        opacity: isSelected ? 0 : undefined,
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

export const MenuWheel = ({ isOpen, onClose }: { isOpen: boolean; onClose: (item?: MenuItem, index?: number) => void }) => {
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

