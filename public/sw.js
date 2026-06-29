const CACHE = 'ganjoorsearch-shell-v5';
const SHELL = ['/ganjoorSearch/', '/ganjoorSearch/index.html'];
const STATIC_ASSETS = [
  '/ganjoorSearch/manifest.webmanifest',
  '/ganjoorSearch/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([...SHELL, ...STATIC_ASSETS])),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ),
  );
});

function isPoetIconPath(pathname) {
  return /\/ganjoorSearch\/icons\/poets\/\d+-(192|512)\.png$/.test(pathname);
}

function isPoetManifestPath(pathname) {
  return /\/ganjoorSearch\/manifests\/poet-\d+\.webmanifest$/.test(pathname);
}

function isPoetPwaPath(pathname) {
  return /\/ganjoorSearch\/pwa\/\d+\/?$/.test(pathname);
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith('/ganjoorSearch/')) return;

  const isShell =
    SHELL.includes(url.pathname) ||
    isPoetPwaPath(url.pathname) ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('manifest.webmanifest') ||
    isPoetIconPath(url.pathname) ||
    isPoetManifestPath(url.pathname);

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      if (isPoetPwaPath(url.pathname)) {
        return caches.match('/ganjoorSearch/index.html').then(
          (shell) => shell || fetch(event.request),
        );
      }

      return fetch(event.request).then((response) => {
        if (response.ok && isShell) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    }),
  );
});
