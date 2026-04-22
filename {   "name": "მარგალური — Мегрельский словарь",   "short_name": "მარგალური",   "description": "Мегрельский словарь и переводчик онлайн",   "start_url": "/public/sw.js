const CACHE_NAME = “margaluri-v1”;

// Основные файлы сайта
const STATIC_ASSETS = [
“/”,
“/index.html”,
“/main.jsx”,
“/manifest.json”,
];

// ── При установке: кэшируем основные файлы ──────────────────────────────────
self.addEventListener(“install”, (event) => {
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => {
return cache.addAll(STATIC_ASSETS).catch(() => {});
})
);
self.skipWaiting();
});

// ── При активации: удаляем старые кэши ──────────────────────────────────────
self.addEventListener(“activate”, (event) => {
event.waitUntil(
caches.keys().then((keys) =>
Promise.all(
keys
.filter((key) => key !== CACHE_NAME)
.map((key) => caches.delete(key))
)
)
);
self.clients.claim();
});

// ── При каждом запросе ───────────────────────────────────────────────────────
self.addEventListener(“fetch”, (event) => {
if (event.request.method !== “GET”) return;

const url = new URL(event.request.url);

// Шрифты Google: кэшируем навсегда (они не меняются)
const isFont =
url.hostname === “fonts.googleapis.com” ||
url.hostname === “fonts.gstatic.com”;

if (isFont) {
event.respondWith(
caches.open(CACHE_NAME).then((cache) =>
cache.match(event.request).then((cached) => {
if (cached) return cached;
return fetch(event.request).then((response) => {
cache.put(event.request, response.clone());
return response;
}).catch(() => cached);
})
)
);
return;
}

// Все остальные запросы: сначала кэш, фоном обновляем
event.respondWith(
caches.open(CACHE_NAME).then((cache) =>
cache.match(event.request).then((cached) => {
const networkFetch = fetch(event.request)
.then((response) => {
if (response && response.status === 200) {
cache.put(event.request, response.clone());
}
return response;
})
.catch(() => cached);

```
    return cached || networkFetch;
  })
)
```

);
});