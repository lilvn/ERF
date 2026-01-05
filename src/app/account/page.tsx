'use client';

import { useState } from 'react';
import type { Metadata } from "next";
import { useAuth } from '@/context/AuthContext';
import { MemberQRCode } from '@/components/Account/MemberQRCode';
import { MembershipCard } from '@/components/Account/MembershipCard';

export default function AccountPage() {
  const { customer, isAuthenticated, isLoading, login, logout, getMemberships } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }

    setIsSubmitting(false);
  };

  const handleLogout = async () => {
    await logout();
    setEmail('');
    setPassword('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Login Form
  if (!isAuthenticated || !customer) {
    return (
      <div className="min-h-screen bg-white text-black">
        <header className="absolute top-0 left-0 right-0 pt-20 z-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-center">ACCOUNT</h1>
        </header>

        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md">
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="#" className="text-black font-semibold hover:underline">
                  Purchase a membership
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Account Dashboard
  const memberships = getMemberships();
  const lastInitial = customer.lastName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-white text-black pb-20">
      <header className="absolute top-0 left-0 right-0 pt-20 z-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-center">ACCOUNT</h1>
      </header>

      <div className="container mx-auto px-4 pt-32">
        {/* Header with Name and Logout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">
              {customer.firstName} {lastInitial}.
            </h2>
            <p className="text-gray-600">{customer.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 border-2 border-black rounded-lg font-semibold hover:bg-black hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Main Grid: QR Code + Memberships */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-gray-200">
            <h3 className="text-xl font-bold mb-4">Member ID</h3>
            <MemberQRCode 
              customerId={customer.customerId}
              customerName={`${customer.firstName} ${lastInitial}.`}
            />
            <p className="text-sm text-gray-600 mt-4 text-center max-w-xs">
              Scan this QR code at the door for access verification
            </p>
          </div>

          {/* Memberships Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Active Memberships</h3>
            {memberships.length > 0 ? (
              memberships.map((membership) => (
                <MembershipCard
                  key={membership.type}
                  type={membership.type}
                  status={membership.active ? 'active' : 'expired'}
                  expiryDate={membership.expiryDate}
                />
              ))
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-300 text-center">
                <p className="text-gray-600 mb-4">No active memberships</p>
                <a
                  href="/ceramics"
                  className="inline-block px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Purchase Membership
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Purchase History */}
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-4">Purchase History</h3>
          {customer.orders.length > 0 ? (
            <div className="space-y-4">
              {customer.orders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold">Order #{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.processedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <p className="font-bold text-lg">
                      ${parseFloat(order.totalPrice).toFixed(2)} {order.currency}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.title}</span>
                        <span className="text-gray-600">Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-300 text-center">
              <p className="text-gray-600">No purchase history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
