'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logoutCustomer } from '@/lib/customerAccountApi';

interface Customer {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  hasCeramicsMembership: boolean;
  isMembershipActive: boolean;
  membershipType: string | null;
  membershipExpiryDate: string | null;
  orders: Array<{
    id: string;
    orderNumber: number;
    totalPrice: string;
    currency: string;
    createdAt: string;
    items: Array<{
      title: string;
      quantity: number;
    }>;
  }>;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomer = async () => {
    try {
      const response = await fetch('/api/auth/customer');
      
      if (response.status === 401) {
        setCustomer(null);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }

      const data = await response.json();
      setCustomer(data);
    } catch (error) {
      console.error('Error fetching customer:', error);
      setCustomer(null);
    }
  };

  // Fetch customer on mount
  useEffect(() => {
    const init = async () => {
      await fetchCustomer();
      setIsLoading(false);
    };
    init();
  }, []);

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      const data = await response.json();
      
      // Clear local state
      setCustomer(null);

      // Redirect to Shopify logout if we have an ID token
      if (data.idToken) {
        logoutCustomer(data.idToken);
      } else {
        // Just reload the page
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force reload anyway
      window.location.href = '/';
    }
  };

  const refreshCustomer = async () => {
    await fetchCustomer();
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        logout,
        refreshCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
}

