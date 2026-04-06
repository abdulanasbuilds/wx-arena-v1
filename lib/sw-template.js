/**
 * WX ARENA Service Worker Template
 * Copy this file to public/sw.js (remove it from .gitignore first)
 */

const CACHE_NAME = "wx-arena-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: smart caching
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth")) return;

  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) return response;
        return fetch(request).then((fetchResponse) => {
          if (!fetchResponse || fetchResponse.status !== 200) return fetchResponse;
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          return fetchResponse;
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match("/") || new Response("Offline", { status: 503 }))
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
