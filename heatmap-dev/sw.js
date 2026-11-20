/* PROJECT PWA DEV V1: offline shell, network-first updates; UI and mock data unchanged. */
const DEV_CACHE='project-pwa-dev-offline-v1-r001';
const SHELL=['./','./index.html','./style.css?v=87','./app.js?v=87','./icon.svg','./manifest.webmanifest?v=8'];
const shellURL=new URL('./',self.registration.scope);
const inScope=url=>url.origin===self.location.origin&&url.pathname.startsWith(shellURL.pathname);
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(DEV_CACHE);
  // Atomic installation: failure to cache any essential asset rejects this SW update.
  await cache.addAll(SHELL.map(path=>new Request(new URL(path,shellURL),{cache:'reload'})));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const key of await caches.keys()){
   if(key.startsWith('project-pwa-dev-')&&key!==DEV_CACHE)await caches.delete(key);
  }
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||!inScope(new URL(req.url)))return;
 const url=new URL(req.url);
 const asset=/\.(?:css|js|svg|webmanifest)$/.test(url.pathname);
 if(req.mode!=='navigate'&&!asset)return;
 event.respondWith((async()=>{
  const cache=await caches.open(DEV_CACHE);
  try{
   const response=await fetch(req,{cache:'no-store'});
   if(response.ok)await cache.put(req,response.clone());
   return response;
  }catch(err){
   const exact=await cache.match(req);
   if(exact)return exact;
   // An installed PWA may navigate with ?dev=install-v2 or other query strings.
   if(req.mode==='navigate'){
    const shell=await cache.match(new URL('./',shellURL));
    if(shell)return shell;
    const index=await cache.match(new URL('./index.html',shellURL));
    if(index)return index;
   }
   // Versioned asset requests can be fulfilled from the pre-cached shell.
   if(asset){
    const fallback=SHELL.find(p=>new URL(p,shellURL).pathname===url.pathname);
    if(fallback){
     const stored=await cache.match(new URL(fallback,shellURL));
     if(stored)return stored;
    }
   }
   throw err;
  }
 })());
});
