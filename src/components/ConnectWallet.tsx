// src/components/ConnectWallet.tsx
import React, { useEffect, useState } from 'react';
import { useTrustWalletConnector } from '../hooks/useTrustWalletConnector';

interface ConnectWalletProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ onConnect, onDisconnect }) => {
  const [mounted, setMounted] = useState(false);
  const { connect, disconnect, isConnecting, isConnected, address, error } = useTrustWalletConnector();

  // Track component mount for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fire onConnect / onDisconnect when wallet status changes
  useEffect(() => {
    if (!mounted) return;
    if (isConnected) {
      onConnect?.();
    } else {
      onDisconnect?.();
    }
  }, [isConnected, mounted, onConnect, onDisconnect]);

  if (!mounted) return null;

  const handleClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect();
    }
  };

  return (
    <div className="connect-wallet-wrapper">
      <button
        className={`connect-btn ${isConnecting ? 'disabled' : ''} ${error ? 'error' : ''}`}
        onClick={handleClick}
        disabled={isConnecting}
      >
        {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect Wallet'}
      </button>

      {error && (
        <div className="connection-error">
          <p>Connection failed: {error}</p>
        </div>
      )}

      {isConnected && address && (
        <div className="wallet-info">
          <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
