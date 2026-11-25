const V="cr7-v18";
const CORE=["./","index.html","fb.js","manifest.json","icon-192.png","icon-512.png","apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=="cr7-fonts").map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    e.respondWith((async()=>{
      const c=await caches.open(V);
      try{
        const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),4000);
        const res=await fetch(r,{signal:ctl.signal});clearTimeout(t);
        if(res&&res.ok)c.put(r,res.clone());
        return res;
      }catch(err){
        const hit=await c.match(r,{ignoreSearch:true})||(r.mode==="navigate"?await c.match("index.html"):null);
        return hit||new Response("offline",{status:503});
      }
    })());
  }else if(u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com"){
    e.respondWith(caches.open("cr7-fonts").then(async c=>{
      const hit=await c.match(r);
      const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque"))c.put(r,res.clone());return res;}).catch(()=>hit);
      return hit||net;
    }));
  }
});
