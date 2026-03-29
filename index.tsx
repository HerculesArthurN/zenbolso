import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { ToastProvider } from './src/contexts/ToastContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { db } from './src/services/db';

// Expose for Headless Smoke Tests
if (typeof window !== 'undefined') {
  (window as any).__test = {
    db,
    queue: db.sync_queue
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>
);