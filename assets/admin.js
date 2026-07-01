const API_BASE = "https://api.gjsx.uno";
const TOKEN_KEY = "zhiwu_admin_token";
const EXPIRY_KEY = "zhiwu_admin_expires_at";

const loginPanel = document.querySelector("[data-login-panel]");
const dashboard = document.querySelector("[data-dashboard]");
const loginForm = document.querySelector("[data-login-form]");
const loginMessage = document.querySelector("[data-login-message]");
const apiState = document.querySelector("[data-api-state]");
const logoutButton = document.querySelector("[data-logout]");
const refreshStarsButton = document.querySelector("[data-refresh-stars]");

function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; }
}

function setToken(token, expiresAt) {
  localStorage.setItem(TOKEN_KEY, token);
  if (expiresAt) localStorage.setItem(EXPIRY_KEY, expiresAt);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
}

function setMessage(text, state = "") {
  if (!loginMessage) return;
  loginMessage.textContent = text;
  loginMessage.classList.toggle("is-error", state === "error");
  loginMessage.classList.toggle("is-ok", state === "ok");
}

function setApiState(text, state = "") {
  if (!apiState) return;
  apiState.textContent = text;
  apiState.classList.toggle("is-error", state === "error");
  apiState.classList.toggle("is-ok", state === "ok");
}

function showDashboard() {
  loginPanel?.classList.add("is-hidden");
  dashboard?.classList.remove("is-hidden");
}

function showLogin() {
  dashboard?.classList.add("is-hidden");
  loginPanel?.classList.remove("is-hidden");
}

async function requestJson(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.message || `Request failed: ${path}`);
  }
  return data;
}

function formatDateTime(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function renderStars(data) {
  const items = Array.isArray(data.items) ? data.items : [];
  const radar = document.querySelector("[data-project-radar]");
  const totalDust = document.querySelector("[data-total-dust]");
  const onlineCount = document.querySelector("[data-online-count]");
  const dust = items.reduce((sum, item) => sum + Number(item.visitsToday || 0), 0);
  const online = items.filter((item) => item.status === "online").length;

  if (totalDust) totalDust.textContent = String(data.visitorsToday || dust || 0);
  if (onlineCount) onlineCount.textContent = `${online}/${items.length}`;
  if (!radar) return;

  if (!items.length) {
    radar.innerHTML = `<p class="empty-state">No project status yet.</p>`;
    return;
  }

  radar.innerHTML = items.map((item) => `
    <article class="project-row">
      <span>${item.id || "project"}</span>
      <strong>${item.name || item.id || "Untitled"}</strong>
      <small>${item.status || "unknown"} · <em>${item.visitsToday || 0} dust</em> · ${item.lastUpdated || "--"}</small>
    </article>
  `).join("");
}

async function loadStars() {
  const radar = document.querySelector("[data-project-radar]");
  if (radar) radar.innerHTML = `<p class="empty-state">Loading project status...</p>`;
  try {
    const data = await requestJson("/api/project-stars", { method: "GET" });
    renderStars(data);
  } catch (error) {
    if (radar) radar.innerHTML = `<p class="empty-state">${error.message || "Failed to load project status."}</p>`;
  }
}

async function verifySession() {
  const token = getToken();
  if (!token) {
    showLogin();
    setApiState("Waiting");
    return;
  }

  try {
    const data = await requestJson("/api/admin/me", { method: "GET" });
    const sessionState = document.querySelector("[data-session-state]");
    const sessionExpiry = document.querySelector("[data-session-expiry]");
    if (sessionState) sessionState.textContent = data.owner || "Owner";
    if (sessionExpiry) sessionExpiry.textContent = `Expires at ${formatDateTime(data.expiresAt || localStorage.getItem(EXPIRY_KEY))}`;
    setApiState("Connected", "ok");
    showDashboard();
    await loadStars();
  } catch (error) {
    clearToken();
    showLogin();
    setApiState("API missing", "error");
    setMessage(error.message || "Please enable the admin API on the server first.", "error");
  }
}

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const password = String(formData.get("password") || "").trim();
  const button = loginForm.querySelector("button[type='submit']");

  if (!password) {
    setMessage("Please enter the admin password.", "error");
    return;
  }

  button.disabled = true;
  button.textContent = "...";
  setMessage("Connecting to server...");

  try {
    const data = await requestJson("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
    setToken(data.token, data.expiresAt);
    setMessage("Login successful.", "ok");
    loginForm.reset();
    await verifySession();
  } catch (error) {
    setApiState("Failed", "error");
    setMessage(error.message || "Login failed. Check server API and password.", "error");
  } finally {
    button.disabled = false;
    button.textContent = "Enter";
  }
});

logoutButton?.addEventListener("click", async () => {
  try { await requestJson("/api/admin/logout", { method: "POST", body: JSON.stringify({}) }); } catch {}
  clearToken();
  showLogin();
  setApiState("Signed out");
  setMessage("Signed out.", "ok");
});

refreshStarsButton?.addEventListener("click", loadStars);
verifySession();