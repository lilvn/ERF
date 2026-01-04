'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const MENU_ITEMS = [
  { name: 'MERCH', path: '/merch', icon: '/Menu/MenuWheel/MERCH.webp' },
  { name: 'GALLERIES', path: '/galleries', icon: '/Menu/MenuWheel/GALLERIES.webp' },
  { name: 'EVENTS', path: '/events', icon: '/Menu/MenuWheel/EVENTS.webp' },
  { name: 'STUDIOS', path: '/studios', icon: '/Menu/MenuWheel/STUDIOS.webp' },
  { name: 'WOODSHOP', path: '/woodshop', icon: '/Menu/MenuWheel/WOODSHOP.webp' },
  { name: 'CERAMICS', path: '/ceramics', icon: '/Menu/MenuWheel/CERAMICS.webp' },
  { name: 'CONTACT', path: '/contact', icon: '/Menu/MenuWheel/CONTACT.webp' },
  { name: 'ACCOUNT', path: '/account', icon: '/Menu/MenuWheel/ACCOUNT.webp' },
];

const MenuItem = ({ item, index, total, onClose }: { 
  item: typeof MENU_ITEMS[0]; 
  index: number; 
  total: number;
  onClose: (path?: string) => void;
}) => {
  const angle = (index / total) * Math.PI * 2;
  const radius = 280;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

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
        marginTop: y - 80
      }}
      className="pointer-events-auto"
    >
      <Link href={item.path} onClick={() => onClose(item.path)}>
        <div className="relative w-40 h-40 hover:scale-110 transition-transform">
          <Image
            src={item.icon}
            alt={item.name}
            fill
            className="object-contain"
            unoptimized 
          />
        </div>
      </Link>
    </motion.div>
  );
};

export const MenuWheel = ({ isOpen, onClose }: { isOpen: boolean; onClose: (path?: string) => void }) => {
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
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

