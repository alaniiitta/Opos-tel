/* Guarda la app en el dispositivo para que funcione sin conexión. Cambia VERSION al publicar una actualización. */
const VERSION = "opos-tel-v15";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, {cache:"reload"}))))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if(url.origin !== location.origin){ return; }              // fuentes y enlaces externos: red normal
  // Primero la red (para recibir actualizaciones); si no hay conexión, la copia guardada
  e.respondWith(fetch(e.request.mode === "navigate" ? new Request(e.request.url, {cache:"no-cache"}) : e.request, {cache:"no-cache"}).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(m => m || caches.match("./index.html"))));
});
