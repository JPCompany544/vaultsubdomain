import React, { useState, useEffect } from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { isMobile, getTrustWalletStoreUrl } from '../utils/mobileUtils';

const projectId = '536c04f6d8471f0b4af9cfa72213eed7';

const TrustWalletConnector = ({ onConnect, onDisconnect }) => {
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

      // Enable the provider to get the URI
      await provider.enable();

      // Get the WalletConnect URI
      const uri = provider.signer?.uri;

      if (uri) {
        // Construct Trust Wallet deep link
        const deepLink = `trustwallet://wc?uri=${encodeURIComponent(uri)}`;

        // Attempt to open Trust Wallet
        window.location.href = deepLink;

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
        // No URI available, fallback to store
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

export default TrustWalletConnector;
