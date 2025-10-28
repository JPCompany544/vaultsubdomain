import { injected } from '@wagmi/connectors'

// Utility to detect Trust Wallet environments accurately
function detectTrustWalletEnvironment() {
  const ua = navigator.userAgent.toLowerCase()
  return {
    isAndroid: /android/i.test(ua),
    isIOS: /iphone|ipad|ipod/i.test(ua),
    isTrustWallet: /trust/i.test(ua),
    isInAppBrowser:
      /trustwallet/i.test(ua) && typeof (window as any).ethereum !== 'undefined'
  }
}

export const TrustWalletConnector = (options?: { shimDisconnect?: boolean }) => {
  const env = detectTrustWalletEnvironment()

  return injected({
    shimDisconnect: true,
    target() {
      // 🔹 Only target Trust Wallet environments
      if (env.isTrustWallet && (window as any).ethereum?.isTrust) {
        return (window as any).ethereum
      }

      // ✅ Fix: When user is inside Trust Wallet on Android (deep-linked from Chrome),
      // disable further deep-link fallback to link.trustwallet.com
      if (env.isAndroid && env.isTrustWallet && (window as any).ethereum) {
        const provider = (window as any).ethereum
        try {
          // Ensure internal bridge usage instead of external link redirect
          provider.isWalletConnect = false
          provider.disableDeepLink = true
          provider.__trustInjected = true
        } catch (e) {
          console.warn('Trust Wallet Android override failed:', e)
        }
        return provider
      }

      // Desktop: Use injected provider as usual
      if (!env.isAndroid && (window as any).ethereum) {
        return (window as any).ethereum
      }

      // Fallback: No provider detected
      return undefined
    },
    unstable_shimAsyncInject: 2000,
  })
}
