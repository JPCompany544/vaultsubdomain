// src/connectors/trustWalletConnector.ts
import { InjectedConnector } from '@wagmi/core';

interface TrustWalletConnectorOptions {
  chains: any[];
  options?: {
    name?: string;
    shimDisconnect?: boolean;
  };
}

export class TrustWalletConnector extends InjectedConnector {
  readonly id = 'trustWallet';
  readonly name = 'Trust Wallet';
  readonly ready = typeof window !== 'undefined' && !!this.#findProvider(window.ethereum);

  constructor({ chains, options }: TrustWalletConnectorOptions) {
    super({
      chains,
      options: {
        name: 'Trust Wallet',
        shimDisconnect: true,
        ...options,
      },
    });
  }

  async connect({ chainId }: { chainId?: number } = {}) {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        throw new Error('No Trust Wallet found');
      }

      if (provider.on) {
        provider.on('accountsChanged', this.onAccountsChanged);
        provider.on('chainChanged', this.onChainChanged);
        provider.on('disconnect', this.onDisconnect);
      }

      this.emit('message', { type: 'connecting' });

      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      // Switch to chain if specified
      let id = await this.getChainId();
      if (chainId && id !== chainId) {
        await this.switchChain(chainId);
        id = chainId;
      }

      return {
        account: accounts[0],
        chain: {
          id,
          unsupported: this.isChainUnsupported(id),
        },
      };
    } catch (error) {
      if (this.isUserRejectedRequestError(error)) {
        throw new Error('User rejected the request.');
      }
      throw error;
    }
  }

  async getProvider() {
    if (typeof window === 'undefined') return;

    // Check for Trust Wallet's injected provider
    if (window.ethereum) {
      // Check if it's Trust Wallet
      if (this.#isTrustWallet(window.ethereum)) {
        return window.ethereum;
      }

      // Check for multiple providers (MetaMask, etc.)
      if (window.ethereum.providers) {
        return window.ethereum.providers.find((provider: any) =>
          this.#isTrustWallet(provider)
        );
      }
    }

    return undefined;
  }

  #findProvider(ethereum?: any) {
    if (!ethereum) return;

    // Direct Trust Wallet detection
    if (this.#isTrustWallet(ethereum)) {
      return ethereum;
    }

    // Check providers array
    if (ethereum.providers) {
      return ethereum.providers.find((provider: any) =>
        this.#isTrustWallet(provider)
      );
    }

    return undefined;
  }

  #isTrustWallet(provider: any): boolean {
    // Check for Trust Wallet specific properties
    if (provider.isTrust) return true;

    // Check user agent for Trust Wallet
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('trust') || userAgent.includes('trustwallet')) {
      return true;
    }

    // Check for Trust Wallet's specific methods
    if (provider.isTrustWallet) return true;

    // Check for window.trustwallet (sometimes injected)
    if ((window as any).trustwallet) return true;

    return false;
  }
}
