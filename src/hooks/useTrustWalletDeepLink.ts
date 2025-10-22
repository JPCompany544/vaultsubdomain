// src/hooks/useTrustWalletDeepLink.ts
import { useState, useEffect, useCallback } from 'react';
import { isMobile, isIOS, isAndroid, getTrustWalletStoreUrl } from '../utils/mobileUtils';

interface UseTrustWalletDeepLinkOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  timeout?: number;
}

interface UseTrustWalletDeepLinkReturn {
  isMobileDevice: boolean;
  isIOSDevice: boolean;
  isAndroidDevice: boolean;
  connect: (walletConnectUri: string) => Promise<void>;
  disconnect: () => void;
}

/**
 * Custom hook for handling Trust Wallet deep link connections on mobile devices
 * Automatically detects device type and manages the deep link flow with fallbacks
 */
export const useTrustWalletDeepLink = (
  options: UseTrustWalletDeepLinkOptions = {}
): UseTrustWalletDeepLinkReturn => {
  const { onConnect, onDisconnect, timeout = 2000 } = options;

  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);

  useEffect(() => {
    const mobile = isMobile();
    const ios = isIOS();
    const android = isAndroid();

    setIsMobileDevice(mobile);
    setIsIOSDevice(ios);
    setIsAndroidDevice(android);
  }, []);

  const connect = useCallback(async (walletConnectUri: string): Promise<void> => {
    if (!isMobileDevice) {
      // Not mobile, skip deep link
      return;
    }

    try {
      // Try deep link first (trust:// scheme)
      const deepLink = `trust://wc?uri=${encodeURIComponent(walletConnectUri)}`;

      // Use both window.location.href and window.open for maximum compatibility
      window.location.href = deepLink;

      // Fallback: try window.open in case location.href is blocked
      const popup = window.open(deepLink, '_blank');
      if (popup) {
        popup.close(); // Close immediately as it's just to trigger the app
      }

      // Set timeout for fallback to universal link or store
      const fallbackTimer = setTimeout(() => {
        if (!document.hidden) {
          // Page still visible, app didn't open
          // Try universal link as fallback
          const universalLink = `https://link.trustwallet.com/wc?uri=${encodeURIComponent(walletConnectUri)}`;
          window.location.href = universalLink;

          // If universal link also doesn't work, redirect to store
          setTimeout(() => {
            if (!document.hidden) {
              const storeUrl = getTrustWalletStoreUrl();
              if (storeUrl) {
                window.location.href = storeUrl;
              }
            }
          }, 1500);
        }
      }, timeout);

      // Listen for successful connection
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // App opened successfully
          clearTimeout(fallbackTimer);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          onConnect?.();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup after timeout
      setTimeout(() => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }, timeout + 3000);

    } catch (error) {
      // Fallback to store on error
      const storeUrl = getTrustWalletStoreUrl();
      if (storeUrl) {
        window.location.href = storeUrl;
      }
    }
  }, [isMobileDevice, timeout, onConnect]);

  const disconnect = useCallback(() => {
    onDisconnect?.();
  }, [onDisconnect]);

  return {
    isMobileDevice,
    isIOSDevice,
    isAndroidDevice,
    connect,
    disconnect,
  };
};
