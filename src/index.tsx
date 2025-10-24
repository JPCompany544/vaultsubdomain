import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http, createStorage, noopStorage } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { PostHogProvider } from 'posthog-js/react';
import { TrustWalletConnector } from './connectors/trustWalletConnector';

// ✅ Setup wagmi config with Trust Wallet prioritized connector
const config = createConfig({
  chains: [mainnet, sepolia],
  storage: createStorage({ storage: noopStorage }),
  multiInjectedProviderDiscovery: false, // Disable to prevent auto-discovery
  connectors: [
    // Trust Wallet connector (prioritized for Trust Wallet environments)
    TrustWalletConnector(),
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
