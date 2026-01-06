'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PastEventsButtonProps {
  showPastEvents: boolean;
  onToggle: () => void;
}

export default function PastEventsButton({ showPastEvents, onToggle }: PastEventsButtonProps) {
  return (
    <motion.button
      onClick={onToggle}
      className="border-4 border-black p-6 bg-white hover:bg-gray-100 transition-colors min-w-[200px]"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <h3 className="text-2xl font-bold text-black">
        {showPastEvents ? 'UPCOMING' : 'PAST'}
      </h3>
      <p className="text-lg text-gray-700">EVENTS</p>
    </motion.button>
  );
}

