/**
 * Optional Cloudflare Worker proxy for Ganjoor API (CORS).
 * Deploy separately and set VITE_API_BASE to your worker URL at build time.
 */
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const apiPath = url.pathname.replace(/^\/api\/ganjoor/, '/api/ganjoor');
    const target = `https://api.ganjoor.net${apiPath}${url.search}`;

    const response = await fetch(target, {
      method: request.method,
      headers: request.headers,
    });

    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
