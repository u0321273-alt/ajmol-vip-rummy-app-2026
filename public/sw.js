const CACHE_NAME = "ajmol-vip-rummy-v4";

const FILES = [
  "/",
  "/index.html",
  "/home/",
  "/home/index.html",
  "/game/",
  "/game/index.html",
  "/lucky-number/",
  "/lucky-number/index.html",
  "/memory-match/",
  "/memory-match/index.html",
  "/number-puzzle/",
  "/number-puzzle/index.html",
  "/profile/",
  "/profile/index.html",
  "/scratch/",
  "/scratch/index.html",
  "/tic-tac-toe/",
  "/tic-tac-toe/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).then(response => {
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      if (event.request.mode === "navigate") {
        const url = new URL(event.request.url);
        const path = url.pathname.endsWith("/")
          ? url.pathname + "index.html"
          : url.pathname;
        return await caches.match(path) || await caches.match("/index.html");
      }
    })
  );
});
