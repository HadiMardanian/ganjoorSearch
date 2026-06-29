const isDev = import.meta.env.DEV;

export const API_BASE = isDev ? '' : 'https://api.ganjoor.net';
export const GANJOOR_SITE = 'https://ganjoor.net';

export function buildApiUrl(
  path: string,
  params?: Record<string, string | number | undefined | null>,
): string {
  const base = `${API_BASE}/api/ganjoor${path}`;
  const url = new URL(base, isDev ? window.location.origin : 'https://api.ganjoor.net');

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value != null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    }
  }

  return url.toString();
}

export async function apiFetch<T>(
  url: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`خطای سرور: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
