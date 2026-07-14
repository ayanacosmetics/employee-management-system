(() => {
  "use strict";

  const KEY = "ems_platform_session";
  const LOGIN_PAGE = "platform-login.html";
  let validating = false;

  function readSession() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "null");
      return value && typeof value === "object" ? value : null;
    } catch (_) {
      return null;
    }
  }

  const session = readSession();

  function logout() {
    localStorage.removeItem(KEY);
    location.replace(LOGIN_PAGE);
  }

  function redirectWithoutDeletingSession() {
    // Digunakan hanya jika halaman dibuka tanpa token. Tidak menghapus sesi
    // yang mungkin sedang ditulis oleh tab/login lain.
    location.replace(LOGIN_PAGE);
  }

  if (!session || !String(session.token || "").trim()) {
    redirectWithoutDeletingSession();
    return;
  }

  const token = String(session.token).trim();
  window.EMS_PLATFORM_TOKEN = token;
  window.EMS_PLATFORM_SESSION = session;
  window.platformLogout = logout;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    let url = typeof input === "string"
      ? input
      : (input instanceof URL ? input.toString() : input?.url || "");
    let nextInput = input;
    const nextInit = { ...init };
    const api = String(window.EMS_API_URL || "");

    if (api && url.startsWith(api)) {
      const method = String(nextInit.method || "GET").toUpperCase();
      if (method === "GET") {
        const u = new URL(url);
        u.searchParams.set("platformToken", token);
        nextInput = u.toString();
      } else if (typeof nextInit.body === "string") {
        try {
          const body = JSON.parse(nextInit.body);
          body.platformToken = token;
          nextInit.body = JSON.stringify(body);
        } catch (_) {}
      }
    }

    const response = await originalFetch(nextInput, nextInit);
    try {
      const data = await response.clone().json();
      // Hanya logout bila server secara eksplisit menyatakan sesi kedaluwarsa.
      if (data?.sessionExpired === true) logout();
    } catch (_) {}
    return response;
  };

  async function validateSession(attempt = 1) {
    if (validating) return;
    validating = true;
    try {
      const url = `${EMS_API_URL}?action=validatePlatformSession&platformToken=${encodeURIComponent(token)}&t=${Date.now()}`;
      const response = await originalFetch(url, { cache: "no-store" });
      const data = await response.json();

      if (data?.success) {
        localStorage.setItem(KEY, JSON.stringify({
          ...session,
          token,
          username: data.username || session.username || "",
          nama: data.nama || session.nama || data.username || "",
          validatedAt: Date.now()
        }));
        document.querySelectorAll("[data-platform-name]").forEach(el => {
          el.textContent = data.nama || data.username || "Owner Platform";
        });
        return;
      }

      if (data?.sessionExpired === true) {
        logout();
        return;
      }

      // Respons non-session error tidak boleh menghapus login.
      if (attempt < 3) {
        validating = false;
        setTimeout(() => validateSession(attempt + 1), attempt * 1200);
      }
    } catch (_) {
      // Gangguan koneksi sementara: pertahankan sesi dan coba ulang.
      if (attempt < 3) {
        validating = false;
        setTimeout(() => validateSession(attempt + 1), attempt * 1200);
      }
    } finally {
      if (attempt >= 3) validating = false;
    }
  }

  document.addEventListener("DOMContentLoaded", () => validateSession());
})();
