import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';

import { queryClient } from './app/queryClient';
import { store } from './app/store';
import BackendMonitor from './components/BackendMonitor';
import AppRoutes from './routes/AppRoutes';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BackendMonitor>
            <AppRoutes />
          </BackendMonitor>
        </QueryClientProvider>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>,
);
