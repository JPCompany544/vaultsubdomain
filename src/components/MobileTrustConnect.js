// src/components/MobileTrustConnect.js
import React, { useState, useEffect } from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { isMobile, isTrustWalletInstalled, getTrustWalletStoreUrl } from '../utils/mobileUtils';

export default function MobileTrustConnect({ onConnect, onDisconnect }) {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isTrustInstalled, setIsTrustInstalled] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const modal = useWeb3Modal();

  useEffect(() => {
    const mobile = isMobile();
    setIsMobileDevice(mobile);
    if (mobile) {
      isTrustWalletInstalled().then(setIsTrustInstalled);
    }
  }, []);

  const handleConnect = async () => {
    if (!isMobileDevice) {
      // Desktop: open modal normally
      modal.open();
      return;
    }

    if (isTrustInstalled === null) {
      // Still checking installation
      return;
    }

    setIsConnecting(true);

    if (isTrustInstalled) {
      // Trust Wallet installed: open modal but it should prioritize Trust Wallet
      modal.open({ view: 'Connect' });
    } else {
      // Not installed: redirect to store
      const storeUrl = getTrustWalletStoreUrl();
      if (storeUrl) {
        window.open(storeUrl, '_blank');
      }
    }

    setIsConnecting(false);
  };

  const getButtonText = () => {
    if (isConnecting) return 'Connecting...';
    if (isMobileDevice && isTrustInstalled === null) return 'Checking...';
    return 'Connect Wallet';
  };

  const getButtonClass = () => {
    let baseClass = 'connect-btn';
    if (isConnecting || (isMobileDevice && isTrustInstalled === null)) {
      baseClass += ' disabled';
    }
    return baseClass;
  };

  return (
    <button
      className={getButtonClass()}
      onClick={handleConnect}
      disabled={isConnecting || (isMobileDevice && isTrustInstalled === null)}
    >
      {getButtonText()}
    </button>
  );
}
