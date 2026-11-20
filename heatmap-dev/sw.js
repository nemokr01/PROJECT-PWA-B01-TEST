/* PROJECT PWA DEV: network-first HTML/CSS/JS, no precache, offline fallback not guaranteed. */
const DEV_CACHE='project-pwa-dev-fallback-v1';
self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('project-pwa-dev-')&&key!==DEV_CACHE)await caches.delete(key);await self.clients.claim();})());});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 if(req.mode==='navigate'||/\.(?:css|js|svg|webmanifest)(?:\?|$)/.test(new URL(req.url).pathname)){
  event.respondWith((async()=>{try{return await fetch(req,{cache:'no-store'});}catch(err){const cached=await caches.match(req);if(cached)return cached;throw err;}})());
 }
});
