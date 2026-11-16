/* Offline support. Bump CACHE when files change. */
var CACHE = 'nur-v1.0.0';
var FILES = ['./', 'index.html', 'styles.css', 'app.js', 'adhan.min.js', 'quran.json', 'adhkar.json', 'hafs.woff2', 'amiri.woff2', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  var fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== location.origin && !fonts) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: url.origin === location.origin }).then(function (hit) {
    var net = fetch(e.request).then(function (res) {
      if (res && (res.ok || res.type === 'opaque')) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
      return res;
    });
    if (hit) { net.catch(function () {}); return hit; }
    return net.catch(function () { return caches.match('index.html'); });
  }));
});
