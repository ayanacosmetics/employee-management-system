(() => {
  "use strict";
  const KEY="ems_platform_session";
  const session=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||"null")}catch(_){return null}})();
  function logout(){localStorage.removeItem(KEY);location.replace("platform-login.html")}
  if(!session?.token){logout();return}
  window.EMS_PLATFORM_TOKEN=String(session.token);
  window.EMS_PLATFORM_SESSION=session;
  window.platformLogout=logout;
  const originalFetch=window.fetch.bind(window);
  window.fetch=async(input,init={})=>{
    let url=typeof input==="string"?input:(input instanceof URL?input.toString():input?.url||"");
    let nextInput=input,nextInit={...init};
    const api=String(window.EMS_API_URL||"");
    if(api&&url.startsWith(api)){
      const method=String(nextInit.method||"GET").toUpperCase();
      if(method==="GET"){
        const u=new URL(url);u.searchParams.set("platformToken",session.token);nextInput=u.toString();
      }else if(typeof nextInit.body==="string"){
        try{const body=JSON.parse(nextInit.body);body.platformToken=session.token;nextInit.body=JSON.stringify(body)}catch(_){}
      }
    }
    const response=await originalFetch(nextInput,nextInit);
    try{const d=await response.clone().json();if(d?.sessionExpired)logout()}catch(_){}
    return response;
  };
  document.addEventListener("DOMContentLoaded",async()=>{
    try{
      const d=await(await originalFetch(`${EMS_API_URL}?action=validatePlatformSession&platformToken=${encodeURIComponent(session.token)}&t=${Date.now()}`,{cache:"no-store"})).json();
      if(!d.success)return logout();
      document.querySelectorAll("[data-platform-name]").forEach(el=>el.textContent=d.nama||d.username||"Owner Platform");
    }catch(_){}
  });
})();
