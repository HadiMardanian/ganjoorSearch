const isDev = import.meta.env.DEV;
const configuredBase = import.meta.env.VITE_API_BASE as string | undefined;

/** Dev uses Vite proxy (''). Prod uses VITE_API_BASE or direct API. */
export const API_BASE = isDev ? '' : (configuredBase ?? 'https://api.ganjoor.net');
export const GANJOOR_SITE = 'https://ganjoor.net';

export function buildApiUrl(
  path: string,
  params?: Record<string, string | number | undefined | null>,
): string {
  const base = `${API_BASE}/api/ganjoor${path}`;
  const origin = isDev ? window.location.origin : API_BASE || 'https://api.ganjoor.net';
  const url = new URL(base, origin);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value != null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    }
  }

  return url.toString();
}

export function buildPoetImageUrl(imagePath?: string): string | undefined {
  if (!imagePath) return undefined;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE || 'https://api.ganjoor.net'}${imagePath}`;
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
