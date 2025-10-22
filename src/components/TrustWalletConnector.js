import React, { useState, useEffect } from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { isMobile, getTrustWalletStoreUrl } from '../utils/mobileUtils';

const projectId = '536c04f6d8471f0b4af9cfa72213eed7';

const TrustWalletConnectorComponent = ({ onConnect, onDisconnect }) => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const modal = useWeb3Modal();

  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);

  const handleDesktopConnect = () => {
    modal.open();
  };

  const handleMobileConnect = async () => {
    setIsConnecting(true);

    try {
      // Initialize Ethereum Provider
      const provider = await EthereumProvider.init({
        projectId,
        chains: [1, 11155111], // mainnet and sepolia
        optionalChains: [],
        rpcMap: {
          1: 'https://mainnet.infura.io/v3/',
          11155111: 'https://sepolia.infura.io/v3/',
        },
        metadata: {
          name: 'TrustLoan',
          description: 'Trust-based ETH loans',
          url: 'https://trustloan.app',
          icons: ['https://trustloan.app/logo.png'],
        },
        showQrModal: false, // Don't show QR modal
      });

      // Start enable process (async)
      const enablePromise = provider.enable();

      // Immediately try to get the URI (it should be available quickly)
      let uri = provider.signer?.uri;

      // If not available yet, wait a short time
      if (!uri) {
        await new Promise(resolve => setTimeout(resolve, 50));
        uri = provider.signer?.uri;
      }

      if (uri) {
        // Trigger deep link synchronously as soon as URI is available
        const deepLink = `trustwallet://wc?uri=${encodeURIComponent(uri)}`;
        window.location.href = deepLink;

        // Wait for enable to complete
        await enablePromise;

        // Set timeout to check if app opened
        const timeout = setTimeout(() => {
          if (!document.hidden) {
            // App didn't open, redirect to store
            provider.disconnect();
            const storeUrl = getTrustWalletStoreUrl();
            if (storeUrl) {
              window.location.href = storeUrl;
            }
          }
        }, 3000);

        // Listen for successful connection
        provider.on('connect', () => {
          clearTimeout(timeout);
          onConnect?.();
        });

        // Listen for disconnection
        provider.on('disconnect', () => {
          onDisconnect?.();
        });

        // Clear timeout if page becomes hidden (app opened)
        const handleVisibilityChange = () => {
          if (document.hidden) {
            clearTimeout(timeout);
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
      } else {
        // URI not available, fallback to store
        const storeUrl = getTrustWalletStoreUrl();
        if (storeUrl) {
          window.location.href = storeUrl;
        }
      }
    } catch (error) {
      // Error occurred, fallback to store
      const storeUrl = getTrustWalletStoreUrl();
      if (storeUrl) {
        window.location.href = storeUrl;
      }
    }

    setIsConnecting(false);
  };

  const handleConnect = () => {
    if (isMobileDevice) {
      handleMobileConnect();
    } else {
      handleDesktopConnect();
    }
  };

  return (
    <button
      className={`connect-btn ${isConnecting ? 'disabled' : ''}`}
      onClick={handleConnect}
      disabled={isConnecting}
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};

export default TrustWalletConnectorComponent;
