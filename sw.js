const CACHE="ems-portal-v12.3-performance";
const ASSETS=["portal-login.html","portal.html","manifest.webmanifest","css/style.css","js/config.js","icons/icon-192.svg","icons/icon-512.svg"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  const isStatic=/\.(?:css|js|svg|png|webmanifest)$/.test(url.pathname);
  if(isStatic){
    event.respondWith(caches.match(event.request).then(cached=>{
      const fresh=fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response;});
      return cached||fresh;
    }));
    return;
  }
  event.respondWith(fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response;}).catch(()=>caches.match(event.request)));
});
