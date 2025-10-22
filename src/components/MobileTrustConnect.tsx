// src/components/MobileTrustConnect.js
import React from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { isMobile } from '../utils/mobileUtils';

export default function MobileTrustConnect({ onConnect, onDisconnect }) {
  const modal = useWeb3Modal();
  const isMobileDevice = isMobile();

  const handleConnect = () => {
    modal.open();
  };

  return (
    <button
      className="connect-btn"
      onClick={handleConnect}
    >
      Connect Wallet
    </button>
  );
}
