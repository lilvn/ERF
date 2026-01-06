'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { SanityEvent, urlFor } from '@/lib/sanity';
import { X } from 'lucide-react';

interface EventModalProps {
  event: SanityEvent | null;
  onClose: () => void;
}

export default function EventModal({ event, onClose }: EventModalProps) {
  if (!event) return null;

  const imageUrl = event.image?.asset?.url ? event.image.asset.url : urlFor(event.image).url();
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
  
  const locationLabel = event.location === 'suydam' ? 'Suydam' : 'Bogart';

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
          className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-lg"
          >
            <X size={24} className="text-black" />
          </button>

          {/* Event Image */}
          <div className="relative w-full h-[400px]">
            <Image
              src={imageUrl}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
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

            <div className="mb-6 text-lg">
              <span className="font-bold">Location:</span> {locationLabel}
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

