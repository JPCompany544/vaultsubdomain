// walletConfig.js
import { createConfig, cookieToInitialState } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected } from '@wagmi/connectors/injected';
import { walletConnect } from '@wagmi/connectors/walletConnect';
import { createPublicClient, http } from 'viem';
import { EthereumClient } from '@web3modal/ethereum';

// 1. Your WalletConnect Project ID (the one you verified domains with)
export const projectId = '536c04f6d8471f0b4af9cfa72213eed7';

// 2. Define supported chains
const chains = [mainnet, sepolia];

// 3. Safe hydration fallback
let initialState;
try {
  initialState = cookieToInitialState();
} catch {
  initialState = undefined;
}

// 4. Create wagmi config with walletConnect metadata nested under options
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    injected(),
    walletConnect({
      projectId,
      chains,
      options: {
        metadata: {
          name: 'TrustLoan',
          description: 'Trust-based ETH loans',
          url: 'https://trustloan.app',
          icons: ['https://trustloan.app/logo.png']
        }
      }
    })
  ],
  publicClient: createPublicClient({
    transport: http(),
    chain: mainnet
  }),
  initialState
});

// 5. Create EthereumClient for Web3Modal
export const ethereumClient = new EthereumClient(wagmiConfig, chains);
