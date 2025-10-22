import React, { useState, useEffect } from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect } from 'wagmi';
import { isMobile } from '../utils/mobileUtils';

interface TrustWalletConnectorProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

/**
 * TrustWalletConnector component provides seamless wallet connection
 * Uses Web3Modal for both desktop and mobile connections
 */
const TrustWalletConnector: React.FC<TrustWalletConnectorProps> = ({
  onConnect,
  onDisconnect
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const modal = useWeb3Modal();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Track connection state changes
  useEffect(() => {
    if (isConnected) {
      setIsConnecting(false);
      onConnect?.();
    }
  }, [isConnected, onConnect]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);

      if (isConnected) {
        // Already connected, disconnect first
        disconnect();
        onDisconnect?.();
        setIsConnecting(false);
      } else {
        // Open Web3Modal - it handles mobile/desktop detection automatically
        modal.open();
      }
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnecting(false);
    }
  };

  return (
    <button
      className={`connect-btn ${isConnecting ? 'disabled' : ''}`}
      onClick={handleConnect}
      disabled={isConnecting}
    >
      {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect Wallet'}
    </button>
  );
};

export default TrustWalletConnector;
