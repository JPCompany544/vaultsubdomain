// src/components/ConnectWallet.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';

interface ConnectWalletProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ onConnect, onDisconnect }) => {
  const [mounted, setMounted] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const { connect, connectors, isPending } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const clearWalletCache = useCallback(() => {
    try {
      localStorage.removeItem('wagmi.store');
      localStorage.removeItem('wagmi.cache');
      localStorage.removeItem('wagmi.wallet');
      localStorage.removeItem('wagmi.connected');
    } catch (_) {}
  }, []);

  const getTrustInjectedProvider = useCallback((): any | undefined => {
    const ethereum = (window as any)?.ethereum;
    console.log('🔍 Checking for Trust Wallet...', {
      hasEthereum: !!ethereum,
      isArray: Array.isArray(ethereum?.providers),
      providersCount: ethereum?.providers?.length || 0
    });
    
    if (!ethereum) {
      console.log('❌ No window.ethereum found');
      return undefined;
    }
    
    const providers: any[] = Array.isArray(ethereum.providers) ? ethereum.providers : [ethereum];
    console.log('🔎 Scanning providers:', providers.map((p: any) => ({
      isTrust: p?.isTrust,
      isTrustWallet: p?.isTrustWallet,
      isMetaMask: p?.isMetaMask,
      name: p?.name || 'unknown'
    })));
    
    const trust = providers.find(
      (p: any) => p?.isTrust || p?.isTrustWallet || p?.providerMap?.trust || p?.__TRUST_PROVIDER__
    );
    
    if (trust) {
      console.log('✅ Trust Wallet found!');
    } else {
      console.log('❌ Trust Wallet not found in providers');
    }
    
    return trust;
  }, []);

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
    console.log('🚀 Connect button clicked');
    
    // Clear any existing timeout
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      setConnectionTimeout(null);
    }

    console.log('📋 Available connectors:', connectors.map(c => ({ id: c.id, name: c.name })));
    
    // Find the Trust Wallet connector - it might have id 'injected' or 'trust' or be the first one
    const trustConnector = connectors.find(
      (connector) => connector.id === 'injected' || connector.id === 'trust' || connector.name === 'Trust Wallet'
    ) || connectors[0]; // Fallback to first connector if specific match not found
    
    console.log('🔌 Trust connector found:', !!trustConnector);
    console.log('🔌 Using connector:', trustConnector ? { id: trustConnector.id, name: trustConnector.name } : 'none');

    if (isTrustBrowser()) {
      console.log('📱 Environment: Trust Browser');
      // Inside Trust Wallet browser - connect directly
      if (trustConnector) {
        try {
          console.log('🔗 Attempting to connect via Trust Browser...');
          sessionStorage.setItem('wagmi-user-connect', 'true');
          connect({ connector: trustConnector });

          // Set timeout to reset connection state if it hangs
          const timeout = setTimeout(() => {
            console.warn('⏱️ Trust Wallet connection timeout - resetting state');
            disconnect();
            setConnectionTimeout(null);
          }, 10000);

          setConnectionTimeout(timeout);
        } catch (error) {
          console.error('❌ Trust Wallet connection failed:', error);
          alert('Connection failed. Please try again.');
        }
      } else {
        console.error('❌ No Trust connector available');
      }
    } else if (isMobile()) {
      console.log('📱 Environment: Mobile - triggering deep link');
      // Mobile browser - trigger deep link redirect
      triggerTrustWalletDeepLink();
    } else {
      console.log('💻 Environment: Desktop');
      // Desktop - prefer Trust extension only
      const trustInjected = getTrustInjectedProvider();

      if (trustConnector && trustInjected) {
        try {
          console.log('🔗 Attempting to connect via Desktop Trust Wallet...');
          sessionStorage.setItem('wagmi-user-connect', 'true');
          await connect({ connector: trustConnector });
          console.log('✅ Connect call completed');
        } catch (error) {
          console.error('❌ Desktop Trust Wallet connection failed:', error);
          alert(`Connection failed: ${(error as Error).message}`);
        }
      } else {
        console.log('⚠️ Trust Wallet not detected - opening install page');
        console.log('  - Connector exists:', !!trustConnector);
        console.log('  - Provider injected:', !!trustInjected);
        // Trust Wallet not installed - open install page
        const win = window.open('https://trustwallet.com/browser-extension', '_blank', 'noopener,noreferrer');
        if (!win) {
          window.location.href = 'https://trustwallet.com/browser-extension';
        }
      }
    }
  }, [connectors, connect, disconnect, isTrustBrowser, isMobile, triggerTrustWalletDeepLink, connectionTimeout, getTrustInjectedProvider]);

  // Track component mount for hydration and prevent auto-reconnect
  useEffect(() => {
    setMounted(true);
    
    // Force disconnect on mount to prevent auto-reconnection
    if (isConnected) {
      console.log('🔄 Auto-disconnect on mount to prevent auto-reconnect');
      disconnect();
    }
  }, []);
  
  // Cleanup any auto-reconnect attempts
  useEffect(() => {
    if (mounted && isConnected && !connectionTimeout) {
      // If connected without user action (auto-reconnect), disconnect
      const wasUserInitiated = sessionStorage.getItem('wagmi-user-connect');
      if (!wasUserInitiated) {
        console.log('🚫 Blocking auto-reconnect - disconnecting');
        disconnect();
      }
    }
  }, [mounted, isConnected, connectionTimeout, disconnect]);

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
    sessionStorage.removeItem('wagmi-user-connect');
    disconnect();
    clearWalletCache();
    setMenuOpen(false);
  }, [disconnect, connectionTimeout, clearWalletCache]);

  if (!mounted) return null;

  const isConnecting = isPending || !!connectionTimeout;

  return (
    <div className="connect-wallet-wrapper" ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className={`connect-btn ${isConnecting ? 'disabled' : ''}`}
        onClick={isConnected ? () => setMenuOpen((v) => !v) : handleConnect}
        disabled={isConnecting}
      >
        {isConnecting
          ? 'Connecting...'
          : isConnected && address
          ? `${address.slice(0, 6)}...${address.slice(-4)}`
          : 'Connect Wallet'}
      </button>

      {isConnected && menuOpen && (
        <div
          className="wallet-menu"
          style={{
            position: 'absolute',
            right: 0,
            marginTop: 8,
            background: '#111827',
            border: '1px solid #374151',
            borderRadius: 8,
            padding: 8,
            zIndex: 20,
            minWidth: 160,
          }}
        >
          <button
            onClick={handleDisconnect}
            className="disconnect-btn"
            style={{
              width: '100%',
              background: '#ef4444',
              color: 'white',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #dc2626',
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
