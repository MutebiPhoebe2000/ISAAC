(function () {
  const TOKEN_KEY = "isaac_auth_token";
  const USER_KEY = "isaac_auth_user";

  function token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function user() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch (_error) {
      return null;
    }
  }

  function setSession(payload) {
    localStorage.setItem(TOKEN_KEY, payload.token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function isLocalFrontend() {
    return (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost")
      && window.location.port !== "3000";
  }

  function route(path) {
    if (!isLocalFrontend()) return path;
    const parts = path.split("?");
    const base = parts[0];
    const query = parts[1] ? "?" + parts[1] : "";
    const localRoutes = {
      "/auth": "../pages/auth.html",
      "/admin/dashboard": "../admin/dashboard.html",
      "/participant/dashboard": "../participant/dashboard.html"
    };
    return (localRoutes[base] || path) + query;
  }

  async function request(path, options = {}) {
    const authToken = token();
    
    const DEPLOYED_BACKEND_URL = "https://isaac-6pok.onrender.com";
    const apiBaseUrl = window.ISAAC_API_BASE_URL
      || (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : DEPLOYED_BACKEND_URL);

    // Automatically route API calls to the backend while preserving split deployment.
    let url = path;
    if (path.startsWith('/api/')) {
      url = apiBaseUrl + path;
    }

    const headers = {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {})
    };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    let response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        body: options.body && !(options.body instanceof FormData) ? JSON.stringify(options.body) : options.body
      });
      
      if (response.status === 401) clearSession();
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Request failed" }));
        throw new Error(error.message || "Request failed");
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) return response.json();
      return response.blob();
    } catch (err) {
      console.error("API request failed:", path, err);
      throw err;
    }
  }

  function requireRole(role) {
    const sessionUser = user();
    
    // Allow impersonation bypass for admins viewing participant dashboard
    const urlParams = new URLSearchParams(window.location.search);
    const isImpersonating = urlParams.has('impersonate');
    
    if (!token() || !sessionUser) {
      window.location.href = route("/auth?tab=login");
      return null;
    }
    
    if (sessionUser.role !== role) {
      // If Admin is impersonating a participant, allow them to view the participant dashboard
      if (sessionUser.role === 'admin' && role === 'delegate' && isImpersonating) {
        return sessionUser;
      }
      
      // Strict role enforcement redirect
      if (sessionUser.role === 'admin') {
        window.location.href = route("/admin/dashboard");
      } else {
        window.location.href = route("/participant/dashboard");
      }
      return null;
    }
    return sessionUser;
  }

  function downloadBlob(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  window.ISAACApi = { request, token, user, setSession, clearSession, requireRole, downloadBlob, route };
})();
