(() => {
  const KEY = "ems_admin_session";
  const loginPage = "login.html";
  let session = null;
  try { session = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (_) {}
  if (!session?.token || Number(session.expiresAt) <= Date.now()) {
    localStorage.removeItem(KEY);
    location.replace(`${loginPage}?next=${encodeURIComponent(location.pathname.split('/').pop() || 'index.html')}`);
    return;
  }
  window.EMS_ADMIN_TOKEN = session.token;
  window.adminLogout = () => { localStorage.removeItem(KEY); location.replace(loginPage); };
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    let url = typeof input === "string" ? input : input.url;
    const isApi = typeof EMS_API_URL !== "undefined" && url.startsWith(EMS_API_URL);
    if (isApi) {
      const method = String(init.method || "GET").toUpperCase();
      if (method === "GET") {
        const u = new URL(url); u.searchParams.set("adminToken", session.token); input = u.toString();
      } else if (typeof init.body === "string") {
        try { const body = JSON.parse(init.body); body.adminToken = session.token; init = {...init, body:JSON.stringify(body)}; } catch (_) {}
      }
    }
    const response = await originalFetch(input, init);
    if (isApi) {
      try { const data = await response.clone().json(); if (data?.sessionExpired) { adminLogout(); } } catch (_) {}
    }
    return response;
  };
  document.addEventListener("DOMContentLoaded", async () => {
    const btn=document.createElement("button"); btn.type="button"; btn.textContent="Keluar Admin"; btn.onclick=adminLogout;
    btn.style.cssText="position:fixed;right:16px;bottom:16px;z-index:9999;border:0;border-radius:999px;padding:10px 14px;background:#111827;color:white;box-shadow:0 8px 24px #0003;cursor:pointer";
    document.body.appendChild(btn);
    try { const r=await originalFetch(`${EMS_API_URL}?action=validateAdminSession&adminToken=${encodeURIComponent(session.token)}&t=${Date.now()}`); const d=await r.json(); if(!d.success)adminLogout(); } catch (_) {}
  });
})();