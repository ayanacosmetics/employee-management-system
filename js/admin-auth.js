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
  function getRequestUrl(input){if(typeof input==="string")return input;if(input instanceof URL)return input.toString();if(typeof Request!=="undefined"&&input instanceof Request)return input.url||"";if(input&&typeof input.url==="string")return input.url;return""}
  function isEmsApiUrl(url){const api=typeof EMS_API_URL==="string"?EMS_API_URL.trim():"";const target=String(url||"").trim();if(!api||!target)return false;try{return new URL(target,location.href).href.startsWith(new URL(api,location.href).href)}catch(_){return target.startsWith(api)}}
  window.fetch=async(input,init={})=>{let requestInput=input,requestInit={...init};const requestUrl=getRequestUrl(input),isApi=isEmsApiUrl(requestUrl);if(isApi){const method=String(requestInit.method||(typeof Request!=="undefined"&&input instanceof Request?input.method:"GET")||"GET").toUpperCase();if(method==="GET"||method==="HEAD"){const url=new URL(requestUrl,location.href);url.searchParams.set("adminToken",session.token);requestInput=url.toString()}else if(typeof requestInit.body==="string"){try{const body=JSON.parse(requestInit.body);body.adminToken=session.token;requestInit.body=JSON.stringify(body)}catch(_){}}}const response=await originalFetch(requestInput,requestInit);if(isApi){try{const data=await response.clone().json();if(data?.sessionExpired)redirectToLogin()}catch(_){}}return response};
  document.addEventListener("DOMContentLoaded",async()=>{const button=document.createElement("button");button.type="button";button.textContent="Keluar Admin";button.onclick=redirectToLogin;button.style.cssText="position:fixed;right:16px;bottom:16px;z-index:9999;border:0;border-radius:999px;padding:10px 14px;background:#111827;color:white;box-shadow:0 8px 24px #0003;cursor:pointer";document.body.appendChild(button);try{const url=new URL(EMS_API_URL);url.searchParams.set("action","validateAdminSession");url.searchParams.set("adminToken",session.token);url.searchParams.set("t",String(Date.now()));const d=await(await originalFetch(url.toString(),{cache:"no-store"})).json();if(!d.success)redirectToLogin();else{session.username=d.username||session.username;session.nama=d.nama||session.nama;session.role=d.role||session.role;localStorage.setItem(STORAGE_KEY,JSON.stringify(session))}}catch(_){}});
})();