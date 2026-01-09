'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { SanityEvent, urlFor } from '@/lib/sanity';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface EventModalProps {
  event: SanityEvent | null;
  onClose: () => void;
}

// Format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
}

// Format date range for multi-day events
function formatDateRange(startDate: string, endDate?: string): string {
  if (endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  }
  return formatDate(startDate);
}

// Format time
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// Get location display
function getLocationDisplay(location: string): string {
  switch (location) {
    case 'suydam':
      return '349 Suydam St, Brooklyn';
    case 'bogart':
      return '94 Bogart St, Brooklyn';
    default:
      return 'See description';
  }
}

export default function EventModal({ event, onClose }: EventModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!event) return null;

  // Collect all images
  const allImages = [
    event.image?.asset?.url || urlFor(event.image).url(),
    ...(event.images || []).map(img => img?.asset?.url || urlFor(img).url())
  ].filter(Boolean);
  
  const hasMultipleImages = allImages.length > 1;
  const isMultiDay = Boolean(event.endDate);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white overflow-hidden max-w-5xl w-full max-h-[85vh] shadow-2xl flex flex-col md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Side - Image */}
          <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto md:h-auto bg-black flex-shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full min-h-[300px] md:min-h-full"
              >
                <Image
                  src={allImages[currentImageIndex]}
                  alt={`${event.title} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-1 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-1 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
                
                {/* Image Counter */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>

          {/* Right Side - Info */}
          <div className="flex-1 p-6 flex flex-col overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 bg-white hover:bg-gray-100 border border-gray-300 rounded-full p-1 transition-colors z-10"
            >
              <X size={18} className="text-black" />
            </button>

            {/* Title */}
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4 pr-8">
              {event.title}
            </h2>

            {/* Event Details */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-black w-16">Date:</span>
                <span className="text-gray-700">
                  {isMultiDay ? formatDateRange(event.date, event.endDate) : formatDate(event.date)}
                </span>
              </div>
              
              {!isMultiDay && (
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-black w-16">Time:</span>
                  <span className="text-gray-700">{formatTime(event.date)}</span>
                </div>
              )}
              
              <div className="flex items-start gap-2">
                <span className="font-semibold text-black w-16">Location:</span>
                <span className="text-gray-700">{getLocationDisplay(event.location)}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4">
              {event.description}
            </p>

            {/* Instagram Button */}
            <a
              href={event.instagramUrl || 'https://www.instagram.com/erf.nyc/'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-black text-white font-medium px-4 py-2 hover:bg-gray-800 transition-colors text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              View on Instagram
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
