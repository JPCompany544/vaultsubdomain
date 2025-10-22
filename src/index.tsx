import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { walletConnect, injected } from '@wagmi/connectors';
import { PostHogProvider } from 'posthog-js/react';

// ✅ Setup wagmi config with Trust Wallet focused connectors
const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(), // For browser extensions and in-app browsers
    walletConnect({
      projectId: '536c04f6d8471f0b4af9cfa72213eed7',
      showQrModal: false, // Disable QR modal for programmatic handling
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// ✅ PostHog options
const options = {
  api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
  loaded: () => {}, // Add loaded callback to satisfy type requirements
};

const queryClient = new QueryClient();

// ✅ Single clean render
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={process.env.REACT_APP_PUBLIC_POSTHOG_KEY || ''}
      options={options}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <App />
        </WagmiProvider>
      </QueryClientProvider>
    </PostHogProvider>
  </React.StrictMode>
);
