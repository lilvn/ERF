'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LocationFilterProps {
  selectedLocation: 'all' | 'suydam' | 'bogart';
  onLocationChange: (location: 'all' | 'suydam' | 'bogart') => void;
}

export default function LocationFilter({ selectedLocation, onLocationChange }: LocationFilterProps) {
  const locations: Array<{ value: 'all' | 'suydam' | 'bogart'; label: string }> = [
    { value: 'all', label: 'ALL EVENTS' },
    { value: 'suydam', label: 'SUYDAM' },
    { value: 'bogart', label: 'BOGART' },
  ];

  return (
    <div className="flex gap-4">
      {locations.map(({ value, label }) => {
        const isSelected = selectedLocation === value;
        
        return (
          <motion.button
            key={value}
            onClick={() => onLocationChange(value)}
            className={`px-6 py-3 font-bold border-2 transition-all ${
              isSelected
                ? 'bg-purple-800 text-white border-purple-800'
                : 'bg-white text-black border-black hover:bg-gray-100'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {label}
          </motion.button>
        );
      })}
    </div>
  );
}

