import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from './app/store';
import { queryClient } from './app/queryClient';
import { HelmetProvider } from 'react-helmet-async';
import AppRoutes from './routes/AppRoutes';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AppRoutes />
        </QueryClientProvider>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>,
);
