// walletConfig.js
import { mainnet, sepolia } from 'wagmi/chains';
import { createConfig, cookieToInitialState } from 'wagmi';
import { injected } from '@wagmi/connectors/injected';
import { walletConnect } from '@wagmi/connectors/walletConnect';
import { createPublicClient, http } from 'viem';
import { EthereumClient } from '@web3modal/ethereum';

export const projectId = '536c04f6d8471f0b4af9cfa72213eed7';

const chains = [mainnet, sepolia];

let initialState;
try {
  initialState = cookieToInitialState();
} catch {
  initialState = undefined;
}

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    injected(),
    walletConnect({
      projectId,
      chains,
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
    transport: http()
  }),
  initialState
});

export const ethereumClient = new EthereumClient(wagmiConfig, chains);
