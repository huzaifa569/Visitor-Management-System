'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

interface TokenExpirationWarningProps {
  warningThresholdMinutes?: number; // Show warning when token expires in X minutes
}

export default function TokenExpirationWarning({ 
  warningThresholdMinutes = 5 
}: TokenExpirationWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { token, refreshAccessToken, logout } = useAuth();

  useEffect(() => {
    if (!token) {
      setShowWarning(false);
      return;
    }

    // Parse JWT token to get expiration time
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return;

      const payload = JSON.parse(atob(tokenParts[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      
      const checkTokenExpiration = () => {
        const now = Date.now();
        const timeUntilExpiration = expirationTime - now;
        const minutesUntilExpiration = Math.floor(timeUntilExpiration / (1000 * 60));

        setTimeRemaining(minutesUntilExpiration);

        // Show warning if token expires within threshold
        if (minutesUntilExpiration <= warningThresholdMinutes && minutesUntilExpiration > 0) {
          setShowWarning(true);
        } else if (minutesUntilExpiration <= 0) {
          // Token has expired
          setShowWarning(false);
          logout();
        } else {
          setShowWarning(false);
        }
      };

      // Check immediately
      checkTokenExpiration();

      // Check every minute
      const interval = setInterval(checkTokenExpiration, 60000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }, [token, warningThresholdMinutes, logout]);

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    try {
      await refreshAccessToken();
      setShowWarning(false);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // The logout will be handled by the refreshAccessToken function
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDismiss = () => {
    setShowWarning(false);
  };

  if (!showWarning) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Session Expiring Soon
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Your session will expire in {timeRemaining} minute{timeRemaining !== 1 ? 's' : ''}. 
              Would you like to extend your session?
            </p>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleRefreshToken}
                disabled={isRefreshing}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Extend Session
                  </>
                )}
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={handleDismiss}
                className="inline-flex rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
