// Service worker de Lukero — network-first con respaldo en caché.
// Requisito de Google Play: sin service worker, una TWA se considera
// "thin wrapper" (política 4.3 Minimum Functionality) y la rechazan.
const CACHE = 'lukero-v1'
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png']

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .catch(() => {})
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  // La API nunca se cachea: los datos del crédito deben ser siempre frescos.
  if (url.pathname.startsWith('/api/')) return

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copia = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {})
        }
        return res
      })
      .catch(() =>
        caches.match(req).then((r) => r || caches.match('/index.html'))
      )
  )
})
