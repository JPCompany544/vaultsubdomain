import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { mainnet, sepolia } from 'wagmi/chains';
import { http } from 'viem';  // ✅ correct source

const projectId = '536c04f6d8471f0b4af9cfa72213eed7';
const chains = [mainnet, sepolia];

const metadata = {
  name: 'TrustLoan',
  description: 'Trust-based ETH loans',
  url: 'https://trustloan.app',
  icons: ['https://trustloan.app/logo.png']
};

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  }
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <App />
      </WagmiConfig>
    </QueryClientProvider>
  </React.StrictMode>
);
