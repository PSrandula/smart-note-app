// Minimal service worker to allow offline caching of static assets
const CACHE = 'smart-note-cache-v1'
const toCache = [ '/', '/index.html' ]

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then(c=>c.addAll(toCache)))
})

self.addEventListener('fetch', (ev) => {
  ev.respondWith(caches.match(ev.request).then(r => r || fetch(ev.request)))
})
