import React, { useState, useEffect } from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { isMobile } from '../utils/mobileUtils';

/**
 * TrustWalletConnector component handles wallet connection with special handling for mobile devices.
 * On mobile, it uses Trust Wallet's universal link to open the app directly.
 * On desktop, it opens the standard Web3Modal.
 */
const TrustWalletConnector: React.FC<{
  onConnect?: () => void;
  onDisconnect?: () => void;
}> = ({ onConnect, onDisconnect }) => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const modal = useWeb3Modal();

  useEffect(() => {
    // Detect mobile device on component mount
    setIsMobileDevice(isMobile());
  }, []);

  /**
   * Handles desktop connection by opening the standard Web3Modal
   */
  const handleDesktopConnect = () => {
    modal.open();
  };

  /**
   * Handles mobile connection by creating WalletConnect session and opening Trust Wallet universal link
   */
  const handleMobileConnect = async () => {
    setIsConnecting(true);

    try {
      // Import EthereumProvider dynamically to avoid SSR issues
      const { default: EthereumProvider } = await import('@walletconnect/ethereum-provider');

      // Initialize WalletConnect provider with project configuration
      const provider = await EthereumProvider.init({
        projectId: '536c04f6d8471f0b4af9cfa72213eed7',
        chains: [1, 11155111], // Ethereum mainnet and Sepolia testnet
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
        showQrModal: false, // Disable QR modal for programmatic handling
      });

      // Enable the provider to establish WalletConnect session
      await provider.enable();

      // Retrieve the WalletConnect URI for the session
      const walletConnectUri = provider.signer?.uri;

      if (walletConnectUri) {
        // Construct Trust Wallet universal link
        // This will open Trust Wallet app if installed, or redirect to store if not
        const universalLink = `https://link.trustwallet.com/wc?uri=${encodeURIComponent(walletConnectUri)}`;

        // Open the universal link - Trust Wallet will handle opening app or store redirect
        window.location.href = universalLink;

        // Listen for connection events
        provider.on('connect', () => {
          onConnect?.();
        });

        provider.on('disconnect', () => {
          onDisconnect?.();
        });
      }
    } catch (error) {
      // Silently handle errors - universal link fallback will handle missing app
    }

    setIsConnecting(false);
  };

  /**
   * Main click handler that routes to appropriate connection method
   */
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
