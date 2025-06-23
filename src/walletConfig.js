// walletConfig.js
import { createConfig, cookieToInitialState, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, walletConnect } from '@wagmi/connectors';
import { createPublicClient } from 'viem';
import { EthereumClient } from '@web3modal/ethereum';

// ✅ 1. Define your WalletConnect projectId
export const projectId = '536c04f6d8471f0b4af9cfa72213eed7';

// ✅ 2. Define supported chains
const chains = [mainnet, sepolia];

// ✅ 3. Safe hydration fallback to avoid errors from malformed cookies
let initialState;
try {
  initialState = cookieToInitialState();
} catch (e) {
  console.warn('WAGMI hydration fallback:', e);
  initialState = undefined;
}

// ✅ 4. Create wagmi config
export const wagmiConfig = createConfig({
  chains,
  connectors: [
  injected(),
  walletConnect({
    projectId,
    metadata: {
      name: 'TrustLoan',
      description: 'Trust-based ETH loans',
      url: 'https://trustloan.app',
      icons: ['https://trustloan.app/logo.png']
    }
  })
],

  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
  ssr: true,
  initialState,
});

// ✅ 5. Create EthereumClient instance for Web3Modal
export const ethereumClient = new EthereumClient(wagmiConfig, chains);
