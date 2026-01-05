'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { generateQRToken } from '@/lib/qrToken';

interface MemberQRCodeProps {
  customerId: string;
  customerName: string;
}

export function MemberQRCode({ customerId, customerName }: MemberQRCodeProps) {
  const [qrValue, setQrValue] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes in seconds
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNewToken = async () => {
    setIsGenerating(true);
    try {
      const token = await generateQRToken(customerId, customerName);
      const verifyUrl = `${window.location.origin}/verify/${token}`;
      setQrValue(verifyUrl);
      setTimeRemaining(180);
    } catch (error) {
      console.error('Failed to generate QR token:', error);
    }
    setIsGenerating(false);
  };

  // Generate initial token
  useEffect(() => {
    generateNewToken();
  }, [customerId, customerName]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      generateNewToken();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          return 180; // Reset will happen in next effect
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!qrValue || isGenerating) {
    return (
      <div className="flex items-center justify-center w-64 h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Generating QR Code...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-4 bg-white rounded-lg shadow-lg border-2 border-gray-200">
        <QRCode value={qrValue} size={256} level="H" />
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">Code refreshes in</p>
        <p className="text-2xl font-bold text-black">{formatTime(timeRemaining)}</p>
        <p className="text-xs text-gray-500 mt-1">For security, this QR code changes every 3 minutes</p>
      </div>
    </div>
  );
}

