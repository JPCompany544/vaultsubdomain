import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiConfig } from 'wagmi';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { mainnet, sepolia } from 'wagmi/chains';
import App from './App';
import './styles.css'; // or your actual stylesheet

const chains = [mainnet, sepolia];
export const projectId = '536c04f6d8471f0b4af9cfa72213eed7';

const appMetadata = {
  name: 'TrustLoan',
  description: 'Trust-based ETH loans',
  url: 'https://trustloan.app',
  icons: ['https://trustloan.app/logo.png']
};

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata: appMetadata
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  metadata: appMetadata
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
