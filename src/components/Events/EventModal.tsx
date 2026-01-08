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

export default function EventModal({ event, onClose }: EventModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index when event changes
  React.useEffect(() => {
    setCurrentImageIndex(0);
  }, [event?._id]);

  if (!event) return null;

  // Collect all images (main image + additional images)
  const allImages = [event.image, ...(event.images || [])].map(img => 
    img?.asset?.url ? img.asset.url : urlFor(img).url()
  );
  
  const hasMultipleImages = allImages.length > 1;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-lg overflow-hidden max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
          >
            <X size={24} className="text-black" />
          </button>

          {/* Event Image Carousel */}
          <div className="relative w-full bg-black" style={{ height: 'clamp(400px, 60vh, 700px)' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
              >
                <Image
                  src={allImages[currentImageIndex]}
                  alt={`${event.title} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                  priority={currentImageIndex === 0}
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows (only show if multiple images) */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            {/* Image Counter & Dots (only show if multiple images) */}
            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                {/* Dot Indicators */}
                <div className="flex gap-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-white w-4'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
                {/* Counter */}
                <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="p-8">
            <h2 className="text-4xl font-bold mb-4">{event.title}</h2>
            
            <div className="flex gap-6 mb-6 text-lg">
              <div>
                <span className="font-bold">Date:</span> {formattedDate}
              </div>
              <div>
                <span className="font-bold">Time:</span> {formattedTime}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-xl mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {event.description}
              </p>
            </div>

            {event.instagramUrl && (
              <div className="pt-4 border-t border-gray-200">
                <a
                  href={event.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-800 hover:text-purple-900 font-bold underline"
                >
                  View on Instagram →
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

