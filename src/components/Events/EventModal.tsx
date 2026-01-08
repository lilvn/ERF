'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { SanityEvent, urlFor } from '@/lib/sanity';
import { X, ChevronLeft, ChevronRight, Instagram, MapPin, Calendar, Clock } from 'lucide-react';

interface EventModalProps {
  event: SanityEvent | null;
  onClose: () => void;
}

// Format date range for multi-day events
function formatDateRange(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  };
  
  if (endDate) {
    const end = new Date(endDate);
    const startStr = start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', options);
    return `${startStr} - ${endStr}`;
  }
  
  return start.toLocaleDateString('en-US', options);
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
      return '349 Suydam St, Brooklyn, NY';
    case 'bogart':
      return '94 Bogart St, Brooklyn, NY';
    default:
      return 'See description for location';
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
          className="bg-white rounded-xl overflow-hidden max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
          >
            <X size={20} className="text-white" />
          </button>

          {/* Image Carousel */}
          <div className="relative w-full aspect-square bg-black">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full"
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
                
                {/* Dot Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Event Details */}
          <div className="p-6">
            {/* Multi-day badge */}
            {isMultiDay && (
              <span className="inline-block bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                Multi-Day Event
              </span>
            )}
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {event.title}
            </h2>

            {/* Event Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar size={18} className="text-purple-600 flex-shrink-0" />
                <span>{formatDateRange(event.date, event.endDate)}</span>
              </div>
              
              {!isMultiDay && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock size={18} className="text-purple-600 flex-shrink-0" />
                  <span>{formatTime(event.date)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin size={18} className="text-purple-600 flex-shrink-0" />
                <span>{getLocationDisplay(event.location)}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-6">
              {event.description}
            </p>

            {/* Instagram Button */}
            {event.instagramUrl && (
              <a
                href={event.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Instagram size={20} />
                View on Instagram
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
