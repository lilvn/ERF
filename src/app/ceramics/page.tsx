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
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* 30 Day Pass */}
              {products.length > 0 && (
                <div className="bg-white p-8 rounded-lg border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="mb-6">
                    <h4 className="text-2xl font-bold mb-2">Ceramics 30 Day Pass</h4>
                  </div>

                  <div className="mb-6">
                    <p className="text-4xl font-bold">
                      ${parseFloat(products[0].price).toFixed(2)}
                    </p>
                  </div>

                  <p className="text-gray-700 mb-8">30 Day Pass for ceramics studio access and services.</p>

                  <button
                    onClick={() => handlePurchase(products[0].variantId)}
                    disabled={purchasingId === products[0].variantId}
                    className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                  >
                    {purchasingId === products[0].variantId ? 'Processing...' : 'Purchase 30 Day Pass'}
                  </button>
                </div>
              )}

              {/* Monthly Membership (Coming Soon) */}
              <div className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg relative opacity-75">
                <div className="absolute top-6 right-6">
                  <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                    COMING SOON
                  </span>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-2xl font-bold mb-2 text-gray-700">Monthly Membership</h4>
                </div>

                <div className="mb-6">
                  <p className="text-4xl font-bold text-gray-700">
                    ${products.length > 0 ? parseFloat(products[0].price).toFixed(2) : '99.00'}
                    <span className="text-lg font-normal text-gray-600"> /month</span>
                  </p>
                </div>

                <p className="text-gray-600 mb-8">Recurring monthly membership for ceramics studio access and services.</p>

                <button
                  disabled
                  className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>

              {products.length === 0 && (
                <div className="col-span-2 text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">
                    Membership options coming soon!
                  </p>
                  <p className="text-sm text-gray-500">
                    Check back later or contact us for more information.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
