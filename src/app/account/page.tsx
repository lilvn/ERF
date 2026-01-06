'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { OTPLogin } from '@/components/Account/OTPLogin';
import { MemberQRCode } from '@/components/Account/MemberQRCode';
import { MembershipCard } from '@/components/Account/MembershipCard';

export default function AccountPage() {
  const { customer, isAuthenticated, isLoading, logout } = useCustomerAuth();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated || !customer) {
    return (
      <div className="min-h-screen bg-white text-black">
        <header className="absolute top-0 left-0 right-0 pt-20 z-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-center">ACCOUNT</h1>
        </header>

        <div className="flex items-center justify-center min-h-screen px-4">
          {error && (
            <div className="absolute top-32 left-1/2 transform -translate-x-1/2 max-w-md w-full">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">
                  {error === 'missing_parameters' && 'Missing required parameters'}
                  {error === 'missing_session' && 'Session expired. Please try again.'}
                  {error === 'invalid_state' && 'Invalid request. Please try again.'}
                  {error === 'authentication_failed' && 'Authentication failed. Please try again.'}
                  {!['missing_parameters', 'missing_session', 'invalid_state', 'authentication_failed'].includes(error) && 'An error occurred. Please try again.'}
                </p>
              </div>
            </div>
          )}
          <OTPLogin />
        </div>
      </div>
    );
  }

  // Authenticated - show account dashboard
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
            onClick={logout}
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
              membershipType={customer.membershipType || 'Unknown'}
              membershipExpiryDate={customer.membershipExpiryDate || ''}
            />
            <p className="text-sm text-gray-600 mt-4 text-center max-w-xs">
              Scan this QR code at the door for access verification
            </p>
          </div>

          {/* Memberships Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Memberships</h3>
            {customer.hasCeramicsMembership ? (
              <MembershipCard
                type="ceramics"
                isActive={customer.isMembershipActive}
                expiryDate={customer.membershipExpiryDate}
              />
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-300 text-center">
                <p className="text-gray-600 mb-4">No memberships found</p>
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
              {customer.orders
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((order) => (
                <div
                  key={order.id}
                  className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold">Order #{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
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
