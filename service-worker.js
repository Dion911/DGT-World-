/* One Paragon PWA Service Worker (build 9eac18817866) */
const CACHE = 'one-paragon-9eac18817866';
const PRECACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/pages/11.png",
  "./assets/pages/12.png",
  "./assets/pages/13.png",
  "./assets/pages/14.png",
  "./assets/pages/15.png",
  "./assets/pages/16.png",
  "./assets/pages/17.png",
  "./assets/pages/18.png",
  "./assets/pages/19.png",
  "./assets/pages/20.png",
  "./assets/pages/21.png",
  "./assets/pages/22.png",
  "./assets/pages/23.png",
  "./assets/icons/icon-72.png",
  "./assets/icons/icon-96.png",
  "./assets/icons/icon-128.png",
  "./assets/icons/icon-144.png",
  "./assets/icons/icon-152.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-384.png",
  "./assets/icons/icon-512.png"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    (async () => {
      const url = new URL(req.url);
      const isSameOrigin = url.origin === self.location.origin;

      if (isSameOrigin) {
        const cached = await caches.match(req);
        if (cached) return cached;
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
          return fresh;
        } catch (e) {
          const shell = await caches.match('./index.html');
          return shell || Response.error();
        }
      }

      try {
        const fresh = await fetch(req);
        return fresh;
      } catch (e) {
        const cached = await caches.match(req);
        return cached || Response.error();
      }
    })()
  );
});
