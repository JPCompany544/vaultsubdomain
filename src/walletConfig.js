import { defaultWagmiConfig, createWeb3Modal } from '@web3modal/wagmi/react';
import { mainnet, sepolia } from 'wagmi/chains';

export const projectId = '536c04f6d8471f0b4af9cfa72213eed7';
export const chains = [mainnet, sepolia];

export const wagmiConfig = defaultWagmiConfig({
  projectId,
  chains,
  metadata: {
    name: 'Xylon',
    description: 'Xylon Crypto Loans',
    url: 'https://xylon.com',
    icons: ['https://xylon.com/icon.png'],
  },
});

// ✅ CALL THIS IMMEDIATELY (do NOT move this inside a component)
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
});
