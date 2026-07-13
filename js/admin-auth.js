(() => {
  "use strict";

  const STORAGE_KEY = "ems_admin_session";
  const LOGIN_PAGE = "login.html";

  function readSession() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!value || typeof value !== "object") return null;
      return value;
    } catch (_) {
      return null;
    }
  }

  function redirectToLogin() {
    localStorage.removeItem(STORAGE_KEY);
    const currentPage = location.pathname.split("/").pop() || "index.html";
    location.replace(`${LOGIN_PAGE}?next=${encodeURIComponent(currentPage)}`);
  }

  const session = readSession();
  if (!session?.token || !Number.isFinite(Number(session.expiresAt)) || Number(session.expiresAt) <= Date.now()) {
    redirectToLogin();
    return;
  }

  window.EMS_ADMIN_TOKEN = String(session.token);
  window.adminLogout = redirectToLogin;

  const originalFetch = window.fetch.bind(window);

  function getRequestUrl(input) {
    if (typeof input === "string") return input;
    if (input instanceof URL) return input.toString();
    if (typeof Request !== "undefined" && input instanceof Request) return input.url || "";
    if (input && typeof input.url === "string") return input.url;
    return "";
  }

  function isEmsApiUrl(url) {
    const api = typeof EMS_API_URL === "string" ? EMS_API_URL.trim() : "";
    const target = String(url || "").trim();
    if (!api || !target) return false;
    try {
      return new URL(target, location.href).href.startsWith(new URL(api, location.href).href);
    } catch (_) {
      return target.startsWith(api);
    }
  }

  window.fetch = async (input, init = {}) => {
    let requestInput = input;
    let requestInit = { ...init };
    const requestUrl = getRequestUrl(input);
    const isApi = isEmsApiUrl(requestUrl);

    if (isApi) {
      const requestMethod = String(
        requestInit.method ||
        (typeof Request !== "undefined" && input instanceof Request ? input.method : "GET") ||
        "GET"
      ).toUpperCase();

      if (requestMethod === "GET" || requestMethod === "HEAD") {
        const url = new URL(requestUrl, location.href);
        url.searchParams.set("adminToken", session.token);
        requestInput = url.toString();
      } else if (typeof requestInit.body === "string") {
        try {
          const body = JSON.parse(requestInit.body);
          body.adminToken = session.token;
          requestInit.body = JSON.stringify(body);
        } catch (_) {
          // Biarkan body non-JSON lewat tanpa diubah.
        }
      }
    }

    const response = await originalFetch(requestInput, requestInit);

    if (isApi) {
      try {
        const data = await response.clone().json();
        if (data?.sessionExpired) redirectToLogin();
      } catch (_) {
        // Respons non-JSON tidak mengganggu halaman.
      }
    }

    return response;
  };

  document.addEventListener("DOMContentLoaded", async () => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Keluar Admin";
    button.onclick = redirectToLogin;
    button.style.cssText = "position:fixed;right:16px;bottom:16px;z-index:9999;border:0;border-radius:999px;padding:10px 14px;background:#111827;color:white;box-shadow:0 8px 24px #0003;cursor:pointer";
    document.body.appendChild(button);

    try {
      const url = new URL(EMS_API_URL);
      url.searchParams.set("action", "validateAdminSession");
      url.searchParams.set("adminToken", session.token);
      url.searchParams.set("t", String(Date.now()));
      const response = await originalFetch(url.toString(), { cache: "no-store" });
      const data = await response.json();
      if (!data.success) redirectToLogin();
    } catch (_) {
      // Gangguan jaringan sementara tidak langsung mengeluarkan admin.
    }
  });
})();
