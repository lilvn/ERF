'use client';

import { useEffect, useState } from 'react';
import type { Metadata } from "next";
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getMembershipProducts, createCheckout } from '@/lib/shopify';

interface MembershipProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  variantId: string;
  isRecurring: boolean;
}

export default function CeramicsPage() {
  const { isAuthenticated, customer } = useCustomerAuth();
  const [products, setProducts] = useState<MembershipProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const hasCeramicsMembership = customer?.hasCeramicsMembership || false;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await getMembershipProducts();
        // Filter for ceramics membership products
        const ceramicsProducts = allProducts
          .filter(p => p.tags.some(tag => tag.toLowerCase().includes('ceramics')))
          .map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            price: p.priceRange.minVariantPrice.amount,
            currency: p.priceRange.minVariantPrice.currencyCode,
            variantId: p.variants.edges[0]?.node.id || '',
            isRecurring: p.tags.some(tag => tag.toLowerCase().includes('subscription')),
          }));
        
        setProducts(ceramicsProducts);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
      setIsLoading(false);
    };

    loadProducts();
  }, []);

  const handlePurchase = async (variantId: string) => {
    setPurchasingId(variantId);
    try {
      const checkout = await createCheckout(variantId);
      window.location.href = checkout.webUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to create checkout. Please try again.');
      setPurchasingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black pb-20">
      <header className="absolute top-0 left-0 right-0 pt-20 z-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-center">CERAMICS</h1>
      </header>

      <div className="container mx-auto px-4 pt-32">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Ceramics Studio Membership</h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            Access our fully equipped ceramics studio with professional wheels, kilns, 
            glazing stations, and storage space. Perfect for artists of all skill levels.
          </p>
        </div>

        {/* Membership Status */}
        {isAuthenticated && hasCeramicsMembership && (
          <div className="max-w-2xl mx-auto mb-12 p-6 bg-green-50 border-2 border-green-500 rounded-lg">
            <div className="flex items-center gap-4">
              <svg
                className="w-8 h-8 text-green-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-bold text-green-800 text-lg">You're a Member!</p>
                <p className="text-green-700">You have active access to the ceramics studio.</p>
              </div>
            </div>
          </div>
        )}

        {/* Membership Options */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Choose Your Membership</h3>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading membership options...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">
                Membership options coming soon!
              </p>
              <p className="text-sm text-gray-500">
                Check back later or contact us for more information.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-8 rounded-lg border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="mb-6">
                    <h4 className="text-2xl font-bold mb-2">{product.title}</h4>
                    {product.isRecurring && (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                        Recurring
                      </span>
                    )}
                  </div>

                  <div className="mb-6">
                    <p className="text-4xl font-bold">
                      ${parseFloat(product.price).toFixed(2)}
                      <span className="text-lg font-normal text-gray-600">
                        {product.isRecurring ? '/month' : ''}
                      </span>
                    </p>
                  </div>

                  <p className="text-gray-700 mb-8">{product.description}</p>

                  <button
                    onClick={() => handlePurchase(product.variantId)}
                    disabled={purchasingId === product.variantId}
                    className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                  >
                    {purchasingId === product.variantId ? 'Processing...' : 'Purchase Membership'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">What's Included</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h4 className="font-bold mb-2">Professional Equipment</h4>
              <p className="text-sm text-gray-600">Access to wheels, kilns, and tools</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h4 className="font-bold mb-2">Storage Space</h4>
              <p className="text-sm text-gray-600">Secure storage for your work</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h4 className="font-bold mb-2">Community Access</h4>
              <p className="text-sm text-gray-600">Join workshops and events</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
