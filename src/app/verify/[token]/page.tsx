'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface VerificationResult {
  valid: boolean;
  customerName?: string;
  customerId?: string;
  membershipType?: string;
  membershipExpiryDate?: string;
  error?: string;
}

export default function VerifyPage() {
  const params = useParams();
  const token = params.token as string;
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch('/api/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        setResult(data);
      } catch (error) {
        setResult({
          valid: false,
          error: 'Verification failed. Please try again.',
        });
      }
      setIsLoading(false);
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Verifying...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-xl text-gray-700">Invalid QR code</p>
        </div>
      </div>
    );
  }

  // Valid Member
  if (result.valid) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-xl shadow-2xl p-6 border-4 border-green-500">
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Status */}
          <h1 className="text-2xl font-bold text-center text-green-600 mb-4">
            ACCESS GRANTED
          </h1>

          {/* Member Info */}
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Member Name</p>
              <p className="text-xl font-bold text-black">{result.customerName}</p>
            </div>

            <div className="bg-green-100 p-3 rounded-lg border-2 border-green-500">
              <p className="text-xs text-green-700 mb-1">Membership Status</p>
              <p className="text-lg font-bold text-green-600">
                {result.membershipType ? `${result.membershipType.toUpperCase()} - ACTIVE` : 'ACTIVE'}
              </p>
            </div>

            {result.membershipExpiryDate && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Valid Till</p>
                <p className="text-base font-semibold text-black">
                  {new Date(result.membershipExpiryDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <p className="text-center text-xs text-gray-500 mt-4">
            Verified at {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  }

  // Invalid/Expired
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-xl shadow-2xl p-6 border-4 border-red-500">
        {/* Error Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        {/* Status */}
        <h1 className="text-2xl font-bold text-center text-red-600 mb-4">
          ACCESS DENIED
        </h1>

        <div className="bg-red-100 p-3 rounded-lg border-2 border-red-500">
          <p className="text-center text-red-700 font-semibold text-sm">
            {result.error || 'Invalid or expired QR code'}
          </p>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          Please ask the member to refresh their QR code in the account page.
        </p>
      </div>
    </div>
  );
}

