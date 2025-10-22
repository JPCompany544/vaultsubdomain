// src/components/ConnectWallet.tsx
import React, { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import TrustWalletConnector from './TrustWalletConnector';

interface ConnectWalletProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ onConnect, onDisconnect }) => {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

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

  return (
    <div>
      <TrustWalletConnector onConnect={onConnect} onDisconnect={onDisconnect} />
    </div>
  );
};

export default ConnectWallet;
