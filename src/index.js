import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { mainnet, sepolia } from 'wagmi/chains';
import { http } from 'viem';
import { PostHogProvider } from 'posthog-js/react';

// ✅ Setup Web3Modal
const projectId = '536c04f6d8471f0b4af9cfa72213eed7';
const chains = [mainnet, sepolia];

const metadata = {
  name: 'TrustLoan',
  description: 'Trust-based ETH loans',
  url: 'https://trustloan.app',
  icons: ['https://trustloan.app/logo.png'],
};

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96d' // Trust Wallet ID
  ],
  enableOnramp: false,
});

// ✅ PostHog options
const options = {
  api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
  defaults: '2025-05-24',
};

const queryClient = new QueryClient();

// ✅ Single clean render
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PostHogProvider apiKey={process.env.REACT_APP_PUBLIC_POSTHOG_KEY} options={options}>
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={wagmiConfig}>
          <App />
        </WagmiConfig>
      </QueryClientProvider>
    </PostHogProvider>
  </React.StrictMode>
);
