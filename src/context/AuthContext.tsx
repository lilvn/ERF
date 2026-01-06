'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { customerLogin, customerLogout, getCustomerData, extractCustomerIdFromGid } from '@/lib/shopify';

interface Customer {
  id: string;
  customerId: string; // Extracted numeric ID
  firstName: string;
  lastName: string;
  email: string;
  tags: string[];
  orders: Array<{
    id: string;
    orderNumber: number;
    processedAt: string;
    totalPrice: string;
    currency: string;
    items: Array<{
      title: string;
      quantity: number;
    }>;
  }>;
}

interface Membership {
  type: 'ceramics' | 'studio';
  active: boolean;
  expiryDate: string | null;
}

interface AuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
  getMemberships: () => Membership[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'shopify_customer_access_token';
const TOKEN_EXPIRY_KEY = 'shopify_token_expiry';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

      if (!token || !expiry) {
        setIsLoading(false);
        return;
      }

      // Check if token is expired
      if (new Date(expiry) < new Date()) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        setIsLoading(false);
        return;
      }

      // Fetch customer data with existing token
      try {
        await fetchCustomer(token);
      } catch (error) {
        console.error('Failed to fetch customer:', error);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const fetchCustomer = async (accessToken: string) => {
    const data = await getCustomerData(accessToken);

    if (!data) {
      throw new Error('Customer not found');
    }

    const customerId = extractCustomerIdFromGid(data.id);

    setCustomer({
      id: data.id,
      customerId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      tags: data.tags,
      orders: data.orders.edges.map(({ node }) => ({
        id: node.id,
        orderNumber: node.orderNumber,
        processedAt: node.processedAt,
        totalPrice: node.totalPriceV2.amount,
        currency: node.totalPriceV2.currencyCode,
        items: node.lineItems.edges.map(({ node: item }) => ({
          title: item.title,
          quantity: item.quantity,
        })),
      })),
    });
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { accessToken, expiresAt } = await customerLogin(email, password);

      // Store token and expiry
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt);

      // Fetch customer data
      await fetchCustomer(accessToken);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
    setIsLoading(false);
  };

  const logout = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    
    if (token) {
      try {
        await customerLogout(token);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    setCustomer(null);
  };

  const refreshCustomer = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return;

    await fetchCustomer(token);
  };

  const getMemberships = (): Membership[] => {
    if (!customer) return [];

    const memberships: Membership[] = [];

    // Check for ceramics membership tag
    if (customer.tags.includes('ceramics-member')) {
      memberships.push({
        type: 'ceramics',
        active: true,
        expiryDate: null, // TODO: Get from metafields when available
      });
    }

    return memberships;
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        login,
        logout,
        refreshCustomer,
        getMemberships,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

