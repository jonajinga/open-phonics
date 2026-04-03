// Open Phonics Service Worker — Offline Support
var CACHE_NAME = "open-phonics-v2";
var URLS_TO_CACHE = [
  "/",
  "/lessons/",
  "/guide/",
  "/stories/",
  "/about/",
  "/contact/",
  "/assets/css/global.css",
  "/assets/js/theme.js",
  "/assets/js/nav.js",
  "/assets/js/pointer.js",
  "/assets/js/progress.js",
  "/manifest.json"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names
          .filter(function (name) { return name !== CACHE_NAME; })
          .map(function (name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  // Network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        // Cache successful GET requests
        if (event.request.method === "GET" && response.status === 200) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(function () {
        return caches.match(event.request);
      })
  );
});
