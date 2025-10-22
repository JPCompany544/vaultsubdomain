// src/utils/mobileUtils.js

// Detect if running on mobile device
export const isMobile = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android|avantgo|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(userAgent);
};

// Detect iOS
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

// Detect Android
export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

// Check if Trust Wallet is installed by attempting to open a test deep link
export const isTrustWalletInstalled = () => {
  return new Promise((resolve) => {
    const testUri = 'trust://wc?uri=test';
    const timeout = 1000; // 1 second timeout

    // Create an iframe to attempt opening the deep link
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = testUri;
    document.body.appendChild(iframe);

    // Set a timeout to assume not installed if no redirect
    const timer = setTimeout(() => {
      document.body.removeChild(iframe);
      resolve(false);
    }, timeout);

    // Listen for page visibility change (app opened)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimeout(timer);
        document.body.removeChild(iframe);
        resolve(true);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
  });
};

// Get Trust Wallet app store URL
export const getTrustWalletStoreUrl = () => {
  if (isIOS()) {
    return 'https://apps.apple.com/app/trust-wallet/id1288339409';
  } else if (isAndroid()) {
    return 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp';
  }
  return null;
};

// Open Trust Wallet via deep link for WalletConnect
export const openTrustWallet = (wcUri) => {
  const deepLink = `trust://wc?uri=${encodeURIComponent(wcUri)}`;
  window.location.href = deepLink;
};
