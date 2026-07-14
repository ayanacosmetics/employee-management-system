(() => {
  "use strict";
  const KEY="ems_platform_session", LOGIN_PAGE="platform-login.html";
  let validating=false, invalidCount=0;
  function readSession(){try{const v=JSON.parse(localStorage.getItem(KEY)||"null");return v&&typeof v==="object"?v:null}catch(_){return null}}
  const session=readSession();
  function logout(){localStorage.removeItem(KEY);location.replace(LOGIN_PAGE)}
  if(!session||!String(session.token||"").trim()){location.replace(LOGIN_PAGE);return}
  const token=String(session.token).trim();
  window.EMS_PLATFORM_TOKEN=token; window.EMS_PLATFORM_SESSION=session; window.platformLogout=logout;
  const originalFetch=window.fetch.bind(window);
  window.fetch=async(input,init={})=>{
    let url=typeof input==="string"?input:(input instanceof URL?input.toString():input?.url||"");
    let nextInput=input; const nextInit={...init}; const api=String((typeof EMS_API_URL!=="undefined"?EMS_API_URL:window.EMS_API_URL)||"");
    if(api&&url.startsWith(api)){
      const method=String(nextInit.method||"GET").toUpperCase();
      if(method==="GET"){const u=new URL(url);u.searchParams.set("platformToken",token);nextInput=u.toString()}
      else if(typeof nextInit.body==="string"){try{const b=JSON.parse(nextInit.body);b.platformToken=token;nextInit.body=JSON.stringify(b)}catch(_){}}
    }
    return originalFetch(nextInput,nextInit);
  };
  async function validateSession(attempt=1){
    if(validating)return; validating=true;
    try{
      const url=`${EMS_API_URL}?action=validatePlatformSession&platformToken=${encodeURIComponent(token)}&t=${Date.now()}`;
      const r=await originalFetch(url,{cache:"no-store"}); const d=await r.json();
      if(d?.success){invalidCount=0;localStorage.setItem(KEY,JSON.stringify({...session,token,username:d.username||session.username||"",nama:d.nama||session.nama||d.username||"",validatedAt:Date.now()}));document.querySelectorAll("[data-platform-name]").forEach(x=>x.textContent=d.nama||d.username||"Owner Platform");return}
      if(d?.sessionExpired===true){invalidCount++; if(invalidCount>=3){logout();return}}
      if(attempt<4){validating=false;setTimeout(()=>validateSession(attempt+1),1500*attempt)}
    }catch(_){if(attempt<4){validating=false;setTimeout(()=>validateSession(attempt+1),1500*attempt)}}
    finally{if(attempt>=4)validating=false}
  }
  setTimeout(()=>validateSession(),700);
})();
