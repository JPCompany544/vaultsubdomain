import React, { useState, useEffect } from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useTrustWalletDeepLink } from '../hooks/useTrustWalletDeepLink';

interface TrustWalletConnectorProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

/**
 * TrustWalletConnector component provides seamless wallet connection
 * On mobile: Uses deep links to open Trust Wallet directly
 * On desktop: Uses standard Web3Modal
 */
const TrustWalletConnector: React.FC<TrustWalletConnectorProps> = ({
  onConnect,
  onDisconnect
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const modal = useWeb3Modal();
  const { isMobileDevice, connect: connectDeepLink } = useTrustWalletDeepLink({
    onConnect,
    onDisconnect,
    timeout: 2000, // 2 second timeout for app detection
  });

  /**
   * Handle desktop connection using standard Web3Modal
   */
  const handleDesktopConnect = () => {
    modal.open();
  };

  /**
   * Handle mobile connection using WalletConnect deep links
   */
  const handleMobileConnect = async () => {
    setIsConnecting(true);

    try {
      // Import EthereumProvider dynamically for SSR safety
      const { default: EthereumProvider } = await import('@walletconnect/ethereum-provider');

      // Initialize WalletConnect provider
      const provider = await EthereumProvider.init({
        projectId: '536c04f6d8471f0b4af9cfa72213eed7',
        chains: [1, 11155111], // Ethereum mainnet and Sepolia
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

      // Retrieve the WalletConnect URI
      const walletConnectUri = provider.signer?.uri;

      if (walletConnectUri) {
        // Use the deep link hook to handle mobile connection
        await connectDeepLink(walletConnectUri);

        // Listen for connection events
        provider.on('connect', () => {
          onConnect?.();
        });

        provider.on('disconnect', () => {
          onDisconnect?.();
        });
      }
    } catch (error) {
      // Error handling is done in the hook
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
