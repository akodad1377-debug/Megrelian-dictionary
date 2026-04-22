const CACHE_NAME = “mingrelian-dict-v1”;

const ASSETS = [
“/”,
“/index.html”,
“/src/main.jsx”,
“/src/App.jsx”,
];

// При установке — кэшируем всё что можем
self.addEventListener(“install”, (event) => {
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => {
return cache.addAll(ASSETS).catch(() => {
// Если какой-то файл не найден — не падаем
});
})
);
self.skipWaiting();
});

// При активации — удаляем старые кэши
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

// При запросе — сначала кэш, потом сеть; если нет сети — только кэш
self.addEventListener(“fetch”, (event) => {
// Пропускаем не-GET запросы
if (event.request.method !== “GET”) return;

event.respondWith(
caches.match(event.request).then((cached) => {
const networkFetch = fetch(event.request)
.then((response) => {
// Сохраняем свежую версию в кэш
if (response && response.status === 200) {
const clone = response.clone();
caches.open(CACHE_NAME).then((cache) => {
cache.put(event.request, clone);
});
}
return response;
})
.catch(() => cached); // Нет сети — возвращаем кэш

```
  // Если есть кэш — отдаём сразу, фоном обновляем
  return cached || networkFetch;
})
```

);
});