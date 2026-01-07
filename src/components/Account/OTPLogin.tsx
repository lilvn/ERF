'use client';

import { useState } from 'react';
import { buildAuthUrl } from '@/lib/customerAccountApi';

export function OTPLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    
    try {
      // Build auth URL and get PKCE values
      const { authUrl, codeVerifier, state, nonce } = await buildAuthUrl();

      // Store PKCE values in cookies (they survive redirects)
      // Set secure flag in production
      const isProduction = window.location.protocol === 'https:';
      const cookieOptions = `path=/; max-age=600; SameSite=Lax${isProduction ? '; Secure' : ''}`;
      
      document.cookie = `pkce_code_verifier=${codeVerifier}; ${cookieOptions}`;
      document.cookie = `oauth_state=${state}; ${cookieOptions}`;
      document.cookie = `oauth_nonce=${nonce}; ${cookieOptions}`;

      // Redirect to Shopify login
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      alert('Failed to initiate login. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center">ERF Login</h2>
        
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? 'Redirecting...' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}

