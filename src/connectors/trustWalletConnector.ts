// src/connectors/trustWalletConnector.ts
import { injected } from '@wagmi/connectors';

export const TrustWalletConnector = (options?: { shimDisconnect?: boolean }) =>
  injected({
    shimDisconnect: true,
    target() {
      console.log('🎯 TrustWalletConnector target() called');
      const ethereum = (window as any)?.ethereum;
      
      if (!ethereum) {
        console.log('❌ No ethereum object in target()');
        return undefined;
      }

      // Detect if we're inside Trust Wallet's in-app browser (especially Android)
      const userAgent = navigator.userAgent.toLowerCase();
      const isTrustInAppBrowser = 
        (userAgent.includes('trust') || userAgent.includes('trustwallet')) && 
        !!ethereum;

      // If we're in Trust Wallet's in-app browser, prioritize the main ethereum object
      // This prevents Android from falling back to deep link redirects
      if (isTrustInAppBrowser) {
        console.log('✅ Detected Trust Wallet in-app browser - using direct provider');
        // Return the ethereum provider directly when inside Trust Wallet
        // This works even if isTrust flag is not set
        return {
          id: 'trust',
          name: 'Trust Wallet',
          provider: ethereum,
        };
      }

      const providers: any[] = Array.isArray((ethereum as any).providers)
        ? (ethereum as any).providers
        : [ethereum];

      console.log('🔍 Target scanning providers:', providers.length);
      
      const trust = providers.find(
        (p: any) => p?.isTrust || p?.isTrustWallet || p?.providerMap?.trust || p?.__TRUST_PROVIDER__
      );
      
      if (trust) {
        console.log('✅ Target found Trust Wallet provider');
        return {
          id: 'trust',
          name: 'Trust Wallet',
          provider: trust,
        };
      }

      console.log('❌ Target did not find Trust Wallet');
      return undefined;
    },
    unstable_shimAsyncInject: 2000,
    ...(options ?? {}),
  });
