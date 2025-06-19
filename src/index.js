import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { mainnet, sepolia } from 'wagmi/chains';
import App from './App';

// ✅ 1. Define chains and projectId first
const chains = [mainnet, sepolia];
const projectId = '536c04f6d8471f0b4af9cfa72213eed7';

// ✅ 2. Create wagmi config next
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata: {
    name: 'Xylon',
    description: 'Instant crypto loans on Xylon',
    url: 'https://xylon.com',
    icons: ['https://xylon.com/icon.png']
  }
});

// ✅ 3. Call createWeb3Modal AFTER wagmiConfig, projectId, and chains are defined
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains
});

// ✅ 4. Create QueryClient
const queryClient = new QueryClient();

// ✅ 5. Render app wrapped in providers
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <App />
      </WagmiProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
