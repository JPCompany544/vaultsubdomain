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
