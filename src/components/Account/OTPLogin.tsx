'use client';

import { useState } from 'react';
import { initiateLogin } from '@/lib/customerAccountApi';
import { generatePKCE, generateState, generateNonce } from '@/lib/pkce';

export function OTPLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    
    try {
      // Generate PKCE values
      const { codeVerifier, codeChallenge } = await generatePKCE();
      const state = generateState();
      const nonce = generateNonce();

      // Store in cookies for the callback (since they survive redirects)
      document.cookie = `pkce_code_verifier=${codeVerifier}; path=/; max-age=600; SameSite=Lax`;
      document.cookie = `oauth_state=${state}; path=/; max-age=600; SameSite=Lax`;
      document.cookie = `oauth_nonce=${nonce}; path=/; max-age=600; SameSite=Lax`;

      // Initiate OAuth flow (redirects to Shopify)
      await initiateLogin();
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      alert('Failed to initiate login. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
        
        <p className="text-gray-600 mb-6 text-center">
          Sign in with your Shopify account to access your membership
        </p>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? 'Redirecting...' : 'Sign In with Shopify'}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/ceramics" className="text-black font-semibold hover:underline">
            Purchase a membership
          </a>
        </p>
      </div>
    </div>
  );
}

