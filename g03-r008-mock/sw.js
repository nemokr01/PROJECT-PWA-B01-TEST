const CACHE='project-pwa-heatmap-v1-r008';
const CACHE_PREFIX='project-pwa-heatmap-';
const FILES=['./','./index.html','./style.css','./app.js','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>event.waitUntil(
 caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
 caches.keys()
  .then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key))))
  .then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request)).then(response=>response||fetch(event.request)));
});
