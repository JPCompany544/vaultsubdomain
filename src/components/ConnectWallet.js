// src/components/ConnectWallet.js
import React, { useEffect, useState } from 'react';

// Optional: your global styles
import '../styles.css';

export default function ConnectWallet() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch for server/client render
  if (!isMounted) return null;

  // Web3Modal native button – automatically styled
  return (
    <w3m-button />
  );
}
