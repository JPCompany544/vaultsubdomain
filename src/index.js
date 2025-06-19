import React            from 'react';
import ReactDOM         from 'react-dom/client';
import './index.css';
import App              from './App';
import reportWebVitals  from './reportWebVitals';

import { WagmiProvider }            from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { wagmiConfig } from './walletConfig';

const queryClient = new QueryClient();
const root        = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);

reportWebVitals();
