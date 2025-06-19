// src/index.js
import './walletConfig';                     // must run first (calls createWeb3Modal & exports wagmiConfig)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from './walletConfig';
import App from './App';

// 1️⃣ Create React Query client
const queryClient = new QueryClient();

// 2️⃣ Render with providers in this exact order:
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* A) QueryClientProvider must come first */}
    <QueryClientProvider client={queryClient}>
      {/* B) WagmiProvider next, so its hooks can use React Query */}
      <WagmiProvider config={wagmiConfig}>
        <App />
      </WagmiProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  mobileWallets: ['trust'],     // 👈 Only show Trust Wallet on mobile
});
