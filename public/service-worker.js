const CACHE = "v1";
const PRELOAD = [
  "/",
  "/index.html",
  "/icons/pwafire128white.png",
  "/manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRELOAD)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res?.ok) {
          e.waitUntil(caches.open(CACHE).then((c) => c.put(e.request, res.clone())));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((cached) => cached ?? Response.error()))
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});
