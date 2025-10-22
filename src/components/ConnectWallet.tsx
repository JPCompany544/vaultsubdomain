// src/components/ConnectWallet.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { TrustWalletConnector } from '../connectors/trustWalletConnector';

interface ConnectWalletProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ onConnect, onDisconnect }) => {
  const [mounted, setMounted] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState<NodeJS.Timeout | null>(null);

  const { connect, connectors, isPending } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Environment detection utilities
  const isMobile = useCallback((): boolean => {
    const userAgent = navigator.userAgent || (navigator as any).vendor || (window as any).opera;
    return /android|avantgo|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(userAgent);
  }, []);

  const isTrustBrowser = useCallback((): boolean => {
    const userAgent = navigator.userAgent.toLowerCase();
    const hasTrustWallet = userAgent.includes('trust') || userAgent.includes('trustwallet');
    const hasInjectedProvider = !!window.ethereum;

    // Check for Trust Wallet specific indicators
    if (hasTrustWallet && hasInjectedProvider) {
      return true;
    }

    // Additional check for Trust Wallet's injected provider
    if ((window.ethereum as any)?.isTrust) {
      return true;
    }

    // Check for window.trustwallet
    if ((window as any).trustwallet) {
      return true;
    }

    return false;
  }, []);

  // Trust Wallet deep link trigger
  const triggerTrustWalletDeepLink = useCallback(() => {
    const currentUrl = encodeURIComponent(window.location.href);
    const deepLinkUrl = `https://link.trustwallet.com/open_url?url=${currentUrl}`;
    window.location.href = deepLinkUrl;
  }, []);

  // Handle connection with timeout
  const handleConnect = useCallback(async () => {
    // Clear any existing timeout
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      setConnectionTimeout(null);
    }

    if (isTrustBrowser()) {
      // Inside Trust Wallet browser - connect directly
      const trustConnector = connectors.find(
        (connector) => connector.id === 'trustWallet'
      );

      if (trustConnector) {
        try {
          connect({ connector: trustConnector });

          // Set timeout to reset connection state if it hangs
          const timeout = setTimeout(() => {
            console.warn('Trust Wallet connection timeout - resetting state');
            // Force disconnect and reset state
            disconnect();
            setConnectionTimeout(null);
          }, 5000);

          setConnectionTimeout(timeout);
        } catch (error) {
          console.error('Trust Wallet connection failed:', error);
        }
      }
    } else if (isMobile()) {
      // Mobile browser - trigger deep link redirect
      triggerTrustWalletDeepLink();
    } else {
      // Desktop - use normal connect flow (will try Trust Wallet connector first)
      const trustConnector = connectors.find(
        (connector) => connector.id === 'trustWallet'
      );

      if (trustConnector) {
        connect({ connector: trustConnector });
      } else {
        // Fallback to injected connector
        const injectedConnector = connectors.find(
          (connector) => connector.id === 'injected'
        );
        if (injectedConnector) {
          connect({ connector: injectedConnector });
        }
      }
    }
  }, [connectors, connect, disconnect, isTrustBrowser, isMobile, triggerTrustWalletDeepLink, connectionTimeout]);

  // Track component mount for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fire onConnect / onDisconnect when wallet status changes
  useEffect(() => {
    if (!mounted) return;

    if (isConnected) {
      // Clear timeout on successful connection
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        setConnectionTimeout(null);
      }
      onConnect?.();
    } else {
      onDisconnect?.();
    }
  }, [isConnected, mounted, onConnect, onDisconnect, connectionTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
    };
  }, [connectionTimeout]);

  const handleDisconnect = useCallback(() => {
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      setConnectionTimeout(null);
    }
    disconnect();
  }, [disconnect, connectionTimeout]);

  if (!mounted) return null;

  const isConnecting = isPending || !!connectionTimeout;

  return (
    <div className="connect-wallet-wrapper">
      <button
        className={`connect-btn ${isConnecting ? 'disabled' : ''}`}
        onClick={isConnected ? handleDisconnect : handleConnect}
        disabled={isConnecting}
      >
        {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect Wallet'}
      </button>

      {isConnected && address && (
        <div className="wallet-info">
          <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
        </div>
      )}

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info" style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
          <p>Environment: {isTrustBrowser() ? 'Trust Browser' : isMobile() ? 'Mobile' : 'Desktop'}</p>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
