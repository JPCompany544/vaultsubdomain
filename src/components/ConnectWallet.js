// src/components/ConnectWallet.js
import React, { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import MobileTrustConnect from './MobileTrustConnect';

export default function ConnectWallet({ onConnect, onDisconnect }) {
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
  }, [isConnected, mounted]);

  if (!mounted) return null;

  return (
    <div>
      <MobileTrustConnect onConnect={onConnect} onDisconnect={onDisconnect} />
    </div>
  );
}
