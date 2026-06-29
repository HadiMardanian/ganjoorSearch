import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const STALE_TIMES = {
  poets: 24 * 60 * 60 * 1000,
  categories: 60 * 60 * 1000,
  search: 5 * 60 * 1000,
  poem: 30 * 60 * 1000,
} as const;
