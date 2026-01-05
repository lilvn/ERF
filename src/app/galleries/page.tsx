'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function GalleriesPage() {
  const galleries = [
    { id: '3rd-story', name: '3RD FLOOR GALLERY', description: '' },
    { id: 'pushup', name: 'PUSHUP GALLERY', description: 'Coming soon.', disabled: true },
  ];

  return (
    <div className="min-h-screen bg-white text-black p-20">
      <header className="absolute top-0 left-0 right-0 pt-20 z-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-center">GALLERIES</h1>
      </header>
      
      <div className="flex flex-col items-center justify-center min-h-screen">
      
      <div className="flex space-x-20">
        {galleries.map((gallery) => (
          <div key={gallery.id} className="relative">
            {gallery.disabled ? (
              <div className="w-[350px] h-[350px] border-4 border-gray-300 rounded-2xl flex flex-col items-center justify-center p-8 grayscale cursor-not-allowed">
                <h2 className="text-3xl font-bold mb-4 text-center">{gallery.name}</h2>
                <p className="text-gray-400 text-center">{gallery.description}</p>
              </div>
            ) : (
              <Link href={`/galleries/${gallery.id}`}>
                <motion.div 
                  whileHover={{ scale: 1.05, borderColor: '#000' }}
                  className="w-[350px] h-[350px] border-4 border-gray-400 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer transition-colors"
                >
                  <h2 className="text-3xl font-bold mb-4 text-center">{gallery.name}</h2>
                  <p className="text-gray-700 text-center">{gallery.description}</p>
                </motion.div>
              </Link>
            )}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

