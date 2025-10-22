// src/hooks/useTrustWalletConnector.ts
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { walletConnect } from '@wagmi/connectors';

interface UseTrustWalletConnectorReturn {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  isConnected: boolean;
  address?: string;
  error?: string;
}

interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  isTrust?: boolean;
}

declare global {
  interface Window {
    // Remove conflicting ethereum declaration - use type assertion instead
  }
}

/**
 * Detects if the app is running inside Trust Wallet's in-app browser
 */
const isInTrustWallet = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  const hasTrustWallet = userAgent.includes('trust') || userAgent.includes('trustwallet');
  const hasInjectedProvider = !!window.ethereum;

  // Check for Trust Wallet specific indicators
  if (hasTrustWallet && hasInjectedProvider) {
    return true;
  }

  // Additional check for Trust Wallet's injected provider
  if ((window.ethereum as any)?.isTrust) {
    return true;
  }

  return false;
};

/**
 * Detects if running on mobile device
 */
const isMobile = (): boolean => {
  const userAgent = navigator.userAgent || (navigator as any).vendor || (window as any).opera;
  return /android|avantgo|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(userAgent);
};

/**
 * Get Trust Wallet app store URL
 */
const getTrustWalletStoreUrl = (): string => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  return isIOS
    ? 'https://apps.apple.com/app/trust-wallet/id1288339409'
    : 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp';
};

/**
 * Custom hook for unified Trust Wallet connection across all environments
 */
export const useTrustWalletConnector = (): UseTrustWalletConnectorReturn => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>();

  const { address, isConnected } = useAccount();
  const { connect: wagmiConnect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const connect = useCallback(async (): Promise<void> => {
    setIsConnecting(true);
    setError(undefined);

    try {
      if (isInTrustWallet()) {
        // Inside Trust Wallet in-app browser - use injected provider directly
        if (window.ethereum) {
          await (window.ethereum as EthereumProvider).request({ method: 'eth_requestAccounts' });
        } else {
          throw new Error('Trust Wallet provider not available');
        }
      } else if (isMobile()) {
        // Mobile browser - use direct deep link approach
        const { EthereumProvider } = await import('@walletconnect/ethereum-provider');

        const provider = await EthereumProvider.init({
          projectId: '536c04f6d8471f0b4af9cfa72213eed7',
          chains: [1, 11155111], // Ethereum mainnet and Sepolia
          optionalChains: [],
          rpcMap: {
            1: 'https://mainnet.infura.io/v3/',
            11155111: 'https://sepolia.infura.io/v3/',
          },
          metadata: {
            name: 'TrustLoan',
            description: 'Trust-based ETH loans',
            url: 'https://trustloan.app',
            icons: ['https://trustloan.app/logo.png'],
          },
          showQrModal: false,
        });

        // Enable the provider to establish WalletConnect session
        await provider.enable();

        // Get the WalletConnect URI
        const walletConnectUri = provider.signer?.uri;

        if (walletConnectUri) {
          // Create deep link
          const deepLink = `trust://wc?uri=${encodeURIComponent(walletConnectUri)}`;

          // Try deep link first
          window.location.href = deepLink;

          // Also try with window.open as fallback
          const popup = window.open(deepLink, '_blank');
          if (popup) {
            popup.close();
          }

          // Set timeout for universal link fallback
          const fallbackTimer = setTimeout(() => {
            if (!document.hidden) {
              // Page still visible, app didn't open
              const universalLink = `https://link.trustwallet.com/wc?uri=${encodeURIComponent(walletConnectUri)}`;
              window.location.href = universalLink;

              // Final fallback to store
              setTimeout(() => {
                if (!document.hidden) {
                  const storeUrl = getTrustWalletStoreUrl();
                  window.location.href = storeUrl;
                }
              }, 2000);
            }
          }, 2000);

          // Listen for successful connection
          const handleVisibilityChange = () => {
            if (document.hidden) {
              clearTimeout(fallbackTimer);
              document.removeEventListener('visibilitychange', handleVisibilityChange);
            }
          };

          document.addEventListener('visibilitychange', handleVisibilityChange);

          // Cleanup after timeout
          setTimeout(() => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
          }, 7000); // 2s deep link + 2s universal + 3s buffer

          // Listen for connection events
          provider.on('connect', () => {
            setIsConnecting(false);
          });

          provider.on('disconnect', () => {
            setIsConnecting(false);
          });
        } else {
          throw new Error('Failed to generate WalletConnect URI');
        }
      } else {
        // Desktop browser - use injected provider (Trust Wallet extension) or WalletConnect
        const injectedConnector = connectors.find(
          (connector) => connector.id === 'injected'
        );

        if (injectedConnector) {
          wagmiConnect({ connector: injectedConnector });
        } else {
          // Fallback to WalletConnect
          const walletConnectConnector = connectors.find(
            (connector) => connector.id === 'walletConnect'
          );
          if (walletConnectConnector) {
            wagmiConnect({ connector: walletConnectConnector });
          } else {
            throw new Error('No suitable connector found');
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      console.error('Trust Wallet connection error:', err);
      setIsConnecting(false);
    }
  }, [connectors, wagmiConnect]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setError(undefined);
  }, [disconnect]);

  return {
    connect,
    disconnect: handleDisconnect,
    isConnecting,
    isConnected,
    address,
    error,
  };
};
