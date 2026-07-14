(() => {
  "use strict";
  const STORAGE_KEY = "ems_admin_session";
  const LOGIN_PAGE = "login.html";
  function readSession(){try{const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");return v&&typeof v==="object"?v:null}catch(_){return null}}
  function redirectToLogin(){localStorage.removeItem(STORAGE_KEY);const current=location.pathname.split("/").pop()||"index.html";location.replace(`${LOGIN_PAGE}?next=${encodeURIComponent(current)}`)}
  const session=readSession();
  if(!session?.token){redirectToLogin();return}
  window.EMS_ADMIN_TOKEN=String(session.token);
  window.EMS_ADMIN_SESSION=session;
  window.adminLogout=redirectToLogin;
  const originalFetch=window.fetch.bind(window);
  const referenceTtl={listToko:300000,listShift:600000};
  const tenantCacheScope=String(session.tenant?.id||session.tenant?.code||"DEFAULT");
  function referenceCacheKey(action){return `ems_ref_${tenantCacheScope}_${action}`}
  function clearReferenceCache(){["listToko","listShift"].forEach(action=>sessionStorage.removeItem(referenceCacheKey(action)))}
  window.emsClearReferenceCache=clearReferenceCache;
  function getRequestUrl(input){if(typeof input==="string")return input;if(input instanceof URL)return input.toString();if(typeof Request!=="undefined"&&input instanceof Request)return input.url||"";if(input&&typeof input.url==="string")return input.url;return""}
  function isEmsApiUrl(url){const api=typeof EMS_API_URL==="string"?EMS_API_URL.trim():"";const target=String(url||"").trim();if(!api||!target)return false;try{return new URL(target,location.href).href.startsWith(new URL(api,location.href).href)}catch(_){return target.startsWith(api)}}
  window.fetch=async(input,init={})=>{let requestInput=input,requestInit={...init};const requestUrl=getRequestUrl(input),isApi=isEmsApiUrl(requestUrl);let method=String(requestInit.method||(typeof Request!=="undefined"&&input instanceof Request?input.method:"GET")||"GET").toUpperCase(),action="";if(isApi){if(method==="GET"||method==="HEAD"){const url=new URL(requestUrl,location.href);action=url.searchParams.get("action")||"";url.searchParams.set("adminToken",session.token);requestInput=url.toString();const ttl=referenceTtl[action];if(ttl){try{const cached=JSON.parse(sessionStorage.getItem(referenceCacheKey(action))||"null");if(cached&&Date.now()-cached.time<ttl)return new Response(cached.body,{status:200,headers:{"Content-Type":"application/json"}})}catch(_){}}}else if(typeof requestInit.body==="string"){try{const body=JSON.parse(requestInit.body);action=String(body.action||"");body.adminToken=session.token;requestInit.body=JSON.stringify(body);if(["saveCabangAdmin","setStatusCabangAdmin"].includes(action))clearReferenceCache()}catch(_){}}}const response=await originalFetch(requestInput,requestInit);if(isApi){try{const clone=response.clone(),data=await clone.json();if(data?.sessionExpired)redirectToLogin();if(response.ok&&referenceTtl[action])sessionStorage.setItem(referenceCacheKey(action),JSON.stringify({time:Date.now(),body:JSON.stringify(data)}))}catch(_){}}return response};
  if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
  document.addEventListener("DOMContentLoaded",async()=>{const button=document.createElement("button");button.type="button";button.textContent="Keluar Admin";button.onclick=redirectToLogin;button.style.cssText="position:fixed;right:16px;bottom:16px;z-index:9999;border:0;border-radius:999px;padding:10px 14px;background:#111827;color:white;box-shadow:0 8px 24px #0003;cursor:pointer";document.body.appendChild(button);try{if(Date.now()-Number(session.validatedAt||0)>300000){const idle=window.requestIdleCallback||((fn)=>setTimeout(fn,800));idle(async()=>{try{const url=new URL(EMS_API_URL);url.searchParams.set("action","validateAdminSession");url.searchParams.set("adminToken",session.token);url.searchParams.set("t",String(Date.now()));const d=await(await originalFetch(url.toString(),{cache:"no-store"})).json();if(!d.success)redirectToLogin();else{session.username=d.username||session.username;session.nama=d.nama||session.nama;session.role=d.role||session.role;session.validatedAt=Date.now();localStorage.setItem(STORAGE_KEY,JSON.stringify(session))}}catch(_){}})}}catch(_){}});
})();