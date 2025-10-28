// src/utils/trustWalletDeepLink.ts

/**
 * Generates a Trust Wallet deep link that properly encodes the current URL
 * and includes the coin_id for Ethereum (60)
 */
export const generateTrustWalletDeepLink = (): string => {
  const currentUrl = window.location.href;
  const encodedUrl = encodeURIComponent(currentUrl);
  
  // Use Trust Wallet's deep link format with coin_id for Ethereum
  const deepLinkUrl = `https://link.trustwallet.com/open_url?coin_id=60&url=${encodedUrl}`;
  
  console.log('🔗 Generated deep link:', deepLinkUrl);
  console.log('📍 Current URL:', currentUrl);
  
  return deepLinkUrl;
};

/**
 * Triggers the Trust Wallet deep link redirect
 * Sets a flag in sessionStorage to track the redirect
 */
export const triggerTrustWalletDeepLink = (): void => {
  // Mark that we're initiating a deep link redirect
  sessionStorage.setItem('trust-wallet-deeplink-initiated', 'true');
  sessionStorage.setItem('trust-wallet-deeplink-timestamp', Date.now().toString());
  
  const deepLinkUrl = generateTrustWalletDeepLink();
  
  console.log('🚀 Triggering Trust Wallet deep link redirect...');
  window.location.href = deepLinkUrl;
};

/**
 * Checks if we recently returned from a Trust Wallet deep link
 */
export const isReturningFromDeepLink = (): boolean => {
  const initiated = sessionStorage.getItem('trust-wallet-deeplink-initiated');
  const timestamp = sessionStorage.getItem('trust-wallet-deeplink-timestamp');
  
  if (!initiated || !timestamp) {
    return false;
  }
  
  // Check if the deep link was initiated within the last 2 minutes
  const timeSinceDeepLink = Date.now() - parseInt(timestamp, 10);
  const twoMinutes = 2 * 60 * 1000;
  
  return timeSinceDeepLink < twoMinutes;
};

/**
 * Clears the deep link tracking flags
 */
export const clearDeepLinkFlags = (): void => {
  sessionStorage.removeItem('trust-wallet-deeplink-initiated');
  sessionStorage.removeItem('trust-wallet-deeplink-timestamp');
};

/**
 * Detects if we're on Android (not in Trust Wallet in-app browser)
 */
export const isAndroidExternalBrowser = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = /android/i.test(userAgent);
  const isTrustInApp = userAgent.includes('trust') || userAgent.includes('trustwallet');
  
  // Return true only if Android AND NOT in Trust Wallet in-app browser
  return isAndroid && !isTrustInApp;
};
