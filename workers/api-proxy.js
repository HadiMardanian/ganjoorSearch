/**
 * Optional Cloudflare Worker proxy for Ganjoor API (CORS).
 * Deploy: npx wrangler deploy --config workers/wrangler.toml
 * Build app with: VITE_API_BASE=https://your-worker.workers.dev npm run build
 */
const UPSTREAM = 'https://api.ganjoor.net';
const POETS_CACHE_TTL_MS = 60 * 60 * 1000;
let poetsCache = { body: null, expiresAt: 0 };

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders() });
    }

    const apiPath = url.pathname.replace(/^\/api\/ganjoor/, '/api/ganjoor');
    const target = `${UPSTREAM}${apiPath}${url.search}`;

    if (apiPath === '/api/ganjoor/poets' && Date.now() < poetsCache.expiresAt && poetsCache.body) {
      return new Response(poetsCache.body, {
        status: 200,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const response = await fetch(target, { method: 'GET' });

    const headers = new Headers(response.headers);
    Object.entries(corsHeaders()).forEach(([key, value]) => headers.set(key, value));

    if (apiPath === '/api/ganjoor/poets' && response.ok) {
      const body = await response.text();
      poetsCache = { body, expiresAt: Date.now() + POETS_CACHE_TTL_MS };
      return new Response(body, { status: response.status, headers });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
