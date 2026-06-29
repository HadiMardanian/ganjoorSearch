import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { fetchPoets } from '@/api/ganjoor';
import App from './App';
import { STALE_TIMES, queryClient } from './lib/queryClient';
import './index.css';
import './highlight.css';

function initTheme() {
  const stored = localStorage.getItem('ganjoorsearch-theme');
  const theme =
    stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  const resolved =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;
  document.documentElement.dataset.theme = resolved;
}

initTheme();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}

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
