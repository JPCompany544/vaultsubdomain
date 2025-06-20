// walletConfig.js
import { createConfig, cookieToInitialState, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { walletConnect, injected } from '@wagmi/connectors';
import { createPublicClient } from 'viem';
import { projectId } from './web3modal'; // make sure this exports your WalletConnect Project ID

// Safe hydration fallback to avoid crashes if cookie is malformed or unavailable
let initialState = undefined;
try {
  initialState = cookieToInitialState();
} catch (e) {
  console.warn('Hydration failed, falling back to fresh state:', e);
}

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    walletConnect({ projectId }),
    injected(), // supports MetaMask and TrustWallet
  ],
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
  ssr: true,
  initialState, // Hydrate from cookies if possible
});
