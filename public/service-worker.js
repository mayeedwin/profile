const CACHE = "cache-v1";
const PRELOAD = [
  "/",
  "/index.html",
  "/work/",
  "/work/index.html",
  "/about/",
  "/about/index.html",
  "/contact/",
  "/contact/index.html",
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

function navFallbackUrls(url) {
  const u = new URL(url);
  const path = u.pathname.replace(/\/$/, "") || "/";
  const base = u.origin;
  if (path === "/") return [base + "/", base + "/index.html"];
  return [base + path + "/", base + path + "/index.html"];
}

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => {
        if (e.request.mode === "navigate") {
          const urls = navFallbackUrls(e.request.url);
          return caches
            .open(CACHE)
            .then((cache) =>
              Promise.all(urls.map((url) => cache.match(url))).then(
                (results) => results.find(Boolean) || Promise.reject()
              )
            );
        }
        return caches.match(e.request);
      })
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});
