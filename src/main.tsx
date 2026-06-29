import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { fetchPoets } from '@/api/ganjoor';
import App from './App';
import { STALE_TIMES, queryClient } from './lib/queryClient';
import './index.css';

queryClient.prefetchQuery({
  queryKey: ['poets'],
  queryFn: ({ signal }) => fetchPoets(signal),
  staleTime: STALE_TIMES.poets,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
