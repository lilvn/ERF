'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface MonthSelectorProps {
  availableMonths: { year: number; month: number; count: number }[];
  selectedMonth: Date;
  onMonthSelect: (year: number, month: number) => void;
}

export default function MonthSelector({ availableMonths, selectedMonth, onMonthSelect }: MonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentMonthLabel = selectedMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  }).toUpperCase();

  return (
    <div className="relative">
      {/* Month Display Box */}
      <motion.div
        onClick={() => setIsOpen(!isOpen)}
        className="border-4 border-black p-6 cursor-pointer hover:bg-gray-100 transition-colors min-w-[200px]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <h2 className="text-4xl font-bold text-black">{currentMonthLabel.split(' ')[0]}</h2>
        <p className="text-xl text-gray-700">{currentMonthLabel.split(' ')[1]}</p>
      </motion.div>

      {/* Dropdown Month List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 bg-white border-4 border-black shadow-lg max-h-[400px] overflow-y-auto z-50 min-w-[200px]"
          >
            {availableMonths.map(({ year, month, count }) => {
              const date = new Date(year, month);
              const label = date.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              }).toUpperCase();
              
              const isSelected = year === selectedMonth.getFullYear() && month === selectedMonth.getMonth();

              return (
                <motion.div
                  key={`${year}-${month}`}
                  onClick={() => {
                    onMonthSelect(year, month);
                    setIsOpen(false);
                  }}
                  className={`p-4 cursor-pointer border-b border-gray-300 hover:bg-purple-100 transition-colors ${
                    isSelected ? 'bg-purple-800 text-white hover:bg-purple-900' : ''
                  }`}
                  whileHover={{ x: 5 }}
                >
                  <div className="font-bold text-lg">{label}</div>
                  <div className="text-sm opacity-75">{count} event{count !== 1 ? 's' : ''}</div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

