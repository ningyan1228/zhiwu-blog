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
const refreshArticlesButton = document.querySelector("[data-refresh-articles]");
const articleForm = document.querySelector("[data-article-form]");
const publishMessage = document.querySelector("[data-publish-message]");
const markdownFileInput = document.querySelector("[data-md-file]");
const fillSlugButton = document.querySelector("[data-fill-slug]");
const previewArticleButton = document.querySelector("[data-preview-article]");
const articlePreview = document.querySelector("[data-article-preview]");
const adminArticles = document.querySelector("[data-admin-articles]");

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

function setMessage(target, text, state = "") {
  if (!target) return;
  target.textContent = text;
  target.classList.toggle("is-error", state === "error");
  target.classList.toggle("is-ok", state === "ok");
}

function setLoginMessage(text, state = "") {
  setMessage(loginMessage, text, state);
}

function setPublishMessage(text, state = "") {
  setMessage(publishMessage, text, state);
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
    throw new Error(data.message || data.error || `Request failed: ${path}`);
  }
  return data;
}

function formatDateTime(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugifyTitle(title) {
  const ascii = String(title || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  if (ascii) return ascii;

  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
  ].join("");
  return `post-${stamp}`;
}

function renderMarkdown(markdown) {
  const lines = String(markdown || "").split(/\r?\n/);
  const html = [];
  let listOpen = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      if (listOpen) {
        html.push("</ul>");
        listOpen = false;
      }
      continue;
    }

    if (line.startsWith("# ")) {
      html.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith("## ")) {
      html.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith("### ")) {
      html.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith("> ")) {
      html.push(`<blockquote>${escapeHtml(line.slice(2))}</blockquote>`);
      continue;
    }

    if (line.startsWith("- ")) {
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${escapeHtml(line.slice(2))}</li>`);
      continue;
    }

    if (listOpen) {
      html.push("</ul>");
      listOpen = false;
    }

    html.push(`<p>${escapeHtml(line)}</p>`);
  }

  if (listOpen) html.push("</ul>");
  return html.join("");
}

function getArticleFormData() {
  if (!articleForm) return null;
  const formData = new FormData(articleForm);
  const title = String(formData.get("title") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const slug = slugInput || slugifyTitle(title);
  const tags = String(formData.get("tags") || "")
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    title,
    slug,
    excerpt: String(formData.get("excerpt") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    tags,
    readTime: Number(formData.get("readTime") || 5),
    markdown: String(formData.get("markdown") || "").trim(),
  };
}

function fillSlugFromTitle() {
  if (!articleForm) return;
  const titleInput = articleForm.elements.title;
  const slugInput = articleForm.elements.slug;
  if (!titleInput || !slugInput) return;
  slugInput.value = slugifyTitle(titleInput.value);
}

function previewArticle() {
  const data = getArticleFormData();
  if (!data || !articlePreview) return;

  if (!data.markdown) {
    setPublishMessage("先写一点 Markdown 正文，再预览。", "error");
    return;
  }

  articlePreview.classList.remove("is-hidden");
  articlePreview.innerHTML = `
    <div class="preview-meta">
      <span>${escapeHtml(data.category || "未分类")}</span>
      <span>${escapeHtml(data.readTime || 5)} min read</span>
      <span>${escapeHtml(data.slug || "new-post")}</span>
    </div>
    <h2>${escapeHtml(data.title || "未命名文章")}</h2>
    <p class="preview-excerpt">${escapeHtml(data.excerpt || "暂无摘要")}</p>
    <div class="markdown-preview-body">${renderMarkdown(data.markdown)}</div>
  `;
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
      <span>${escapeHtml(item.id || "project")}</span>
      <strong>${escapeHtml(item.name || item.id || "Untitled")}</strong>
      <small>${escapeHtml(item.status || "unknown")} · <em>${Number(item.visitsToday || 0)} dust</em> · ${escapeHtml(item.lastUpdated || "--")}</small>
    </article>
  `).join("");
}

function renderArticleList(data) {
  if (!adminArticles) return;
  const items = Array.isArray(data.items) ? data.items : [];

  if (!items.length) {
    adminArticles.innerHTML = `<p class="empty-state">还没有从仓库读取到文章。</p>`;
    return;
  }

  adminArticles.innerHTML = `
    <div class="admin-article-list">
      ${items.map((article) => `
        <article>
          <span>${escapeHtml(article.date || "--")} · ${escapeHtml(article.category || "未分类")}</span>
          <strong>${escapeHtml(article.title || article.slug || "未命名文章")}</strong>
          <small>${escapeHtml(article.slug || "")} · ${Number(article.readTime || 0)} min</small>
        </article>
      `).join("")}
    </div>
  `;
}

async function loadStars() {
  const radar = document.querySelector("[data-project-radar]");
  if (radar) radar.innerHTML = `<p class="empty-state">Loading project status...</p>`;
  try {
    const data = await requestJson("/api/project-stars", { method: "GET" });
    renderStars(data);
  } catch (error) {
    if (radar) radar.innerHTML = `<p class="empty-state">${escapeHtml(error.message || "Failed to load project status.")}</p>`;
  }
}

async function loadArticles() {
  if (adminArticles) adminArticles.innerHTML = `<p class="empty-state">正在读取 GitHub 文章列表...</p>`;
  try {
    const data = await requestJson("/api/admin/articles", { method: "GET" });
    renderArticleList(data);
  } catch (error) {
    if (adminArticles) adminArticles.innerHTML = `<p class="empty-state">${escapeHtml(error.message || "文章接口还没有部署。")}</p>`;
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
    await Promise.all([loadStars(), loadArticles()]);
  } catch (error) {
    clearToken();
    showLogin();
    setApiState("API missing", "error");
    setLoginMessage(error.message || "Please enable the admin API on the server first.", "error");
  }
}

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const password = String(formData.get("password") || "").trim();
  const button = loginForm.querySelector("button[type='submit']");

  if (!password) {
    setLoginMessage("Please enter the admin password.", "error");
    return;
  }

  button.disabled = true;
  button.textContent = "...";
  setLoginMessage("Connecting to server...");

  try {
    const data = await requestJson("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
    setToken(data.token, data.expiresAt);
    setLoginMessage("Login successful.", "ok");
    loginForm.reset();
    await verifySession();
  } catch (error) {
    setApiState("Failed", "error");
    setLoginMessage(error.message || "Login failed. Check server API and password.", "error");
  } finally {
    button.disabled = false;
    button.textContent = "进入";
  }
});

articleForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = getArticleFormData();
  const button = document.querySelector("[data-publish-button]");

  if (!data.title || !data.excerpt || !data.category || !data.markdown) {
    setPublishMessage("标题、摘要、分类和正文都要填写。", "error");
    return;
  }

  articleForm.elements.slug.value = data.slug;
  button.disabled = true;
  button.textContent = "发布中...";
  setPublishMessage("正在提交到服务器，服务器会写入 GitHub 仓库...");

  try {
    const result = await requestJson("/api/admin/articles/publish", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setPublishMessage(`发布成功：${result.article?.title || data.title}`, "ok");
    articleForm.reset();
    if (articlePreview) articlePreview.classList.add("is-hidden");
    await loadArticles();
  } catch (error) {
    setPublishMessage(error.message || "发布失败，请检查服务器 GitHub Token 和接口。", "error");
  } finally {
    button.disabled = false;
    button.textContent = "发布到 GitHub";
  }
});

markdownFileInput?.addEventListener("change", async () => {
  const file = markdownFileInput.files?.[0];
  if (!file || !articleForm) return;

  const markdown = await file.text();
  articleForm.elements.markdown.value = markdown;
  const firstTitle = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (firstTitle && !articleForm.elements.title.value.trim()) {
    articleForm.elements.title.value = firstTitle;
  }
  if (!articleForm.elements.slug.value.trim()) fillSlugFromTitle();
  setPublishMessage(`已读取 ${file.name}。`, "ok");
});

fillSlugButton?.addEventListener("click", fillSlugFromTitle);
previewArticleButton?.addEventListener("click", previewArticle);
refreshStarsButton?.addEventListener("click", loadStars);
refreshArticlesButton?.addEventListener("click", loadArticles);

logoutButton?.addEventListener("click", async () => {
  try { await requestJson("/api/admin/logout", { method: "POST", body: JSON.stringify({}) }); } catch {}
  clearToken();
  showLogin();
  setApiState("Signed out");
  setLoginMessage("Signed out.", "ok");
});

verifySession();