export type AnalyticsEvent =
  | 'search'
  | 'poem_open'
  | 'poet_install'
  | 'export';

interface AnalyticsPayload {
  [key: string]: string | number | boolean | undefined;
}

const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined;

export function trackEvent(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (import.meta.env.DEV) {
    console.debug('[analytics]', event, payload);
  }

  if (!endpoint) return;

  const body = JSON.stringify({
    event,
    payload,
    path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    ts: Date.now(),
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, body);
      return;
    }
    void fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch {
    /* ignore analytics failures */
  }
}
