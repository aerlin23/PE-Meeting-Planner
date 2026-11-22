const CACHE='pe-meeting-planner-v5.5',DATA_CACHE='pe-planner-vademecum';
const ROOT=new URL('./',self.location.href).href,SHELL=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-maskable.svg'];
// Composition des commissions : fichier du Vademecum (même site GitHub Pages).
const DATA=new URL('/Parlement-europeen_10th-term/members.json',self.location.origin).href;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL))
 .then(()=>caches.open(DATA_CACHE)).then(c=>c.match(DATA).then(hit=>hit||c.add(DATA))).catch(()=>{}).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('pe-meeting-planner-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// Version enregistrée servie tout de suite, mise à jour en arrière-plan ; les pages sont prévenues si elle a changé.
async function vademecum(event){const c=await caches.open(DATA_CACHE),cached=await c.match(DATA),oldText=cached?cached.clone().text():Promise.resolve(null);
 const net=fetch(DATA,{cache:'no-cache'}).then(async res=>{if(!res.ok)return cached||res;const fresh=await res.clone().text(),old=await oldText;
  await c.put(DATA,res.clone());if(old!==null&&old!==fresh)(await self.clients.matchAll()).forEach(cl=>cl.postMessage({type:'vademecum-updated'}));return res}).catch(()=>cached||Response.error());
 if(cached){event.waitUntil(net);return cached}return net}
self.addEventListener('fetch',event=>{const req=event.request;const url=new URL(req.url);if(req.method!=='GET')return;
 if(url.origin+url.pathname===DATA){event.respondWith(vademecum(event));return}
 if(!url.href.startsWith(ROOT))return;
 if(req.mode==='navigate'){event.respondWith(fetch(req).then(async res=>{if(res.ok){try{const c=await caches.open(CACHE);await c.put(new URL('index.html',ROOT).href,res.clone());}catch(e){}}return res;}).catch(async()=>await caches.match(new URL('index.html',ROOT).href)||await caches.match(ROOT)||Response.error()));return;}
 event.respondWith(caches.match(req,{ignoreSearch:true}).then(cached=>cached||fetch(req)));});
