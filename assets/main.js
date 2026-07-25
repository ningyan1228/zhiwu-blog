const canvas = document.querySelector("#starfield");
const ctx = canvas.getContext("2d");
const fxCanvas = document.querySelector("#click-effects");
const fxCtx = fxCanvas.getContext("2d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const themeToggle = document.querySelector(".theme-toggle");
let width = 0;
let height = 0;
let stars = [];
let particles = [];
let rafId = null;
let fxRafId = null;

function setTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("light-theme", isLight);

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isLight));
    themeToggle.setAttribute("title", isLight ? "切换为黑夜模式" : "切换为白天模式");
  }
}

function initTheme() {
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem("theme");
  } catch {
    savedTheme = null;
  }

  const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  setTheme(savedTheme || (systemPrefersLight ? "light" : "dark"));
}

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  fxCanvas.width = Math.floor(width * ratio);
  fxCanvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  fxCanvas.style.width = `${width}px`;
  fxCanvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  fxCtx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(220, Math.max(90, Math.floor((width * height) / 9000)));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.35 + 0.25,
    a: Math.random() * 0.55 + 0.35,
    v: Math.random() * 0.14 + 0.03,
  }));
}

function drawStars() {
  ctx.clearRect(0, 0, width, height);

  for (const star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(248, 250, 252, ${star.a})`;
    ctx.fill();

    if (!prefersReducedMotion) {
      star.y += star.v;
      star.x += Math.sin(star.y * 0.006) * 0.035;
      if (star.y > height + 4) {
        star.y = -4;
        star.x = Math.random() * width;
      }
    }
  }

  if (!prefersReducedMotion) {
    rafId = requestAnimationFrame(drawStars);
  }
}

function burstAt(x, y) {
  if (prefersReducedMotion) {
    return;
  }

  const count = 8;

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 18 + Math.random() * 34;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * distance,
      vy: Math.sin(angle) * distance,
      life: 1,
      decay: 0.047 + Math.random() * 0.015,
      size: Math.random() * 1.15 + 0.55,
      phase: Math.random() * Math.PI * 2,
    });
  }

  particles.push({
    x,
    y,
    vx: 0,
    vy: 0,
    life: 1,
    decay: 0.055,
    size: 1,
    isRipple: true,
  });

  if (!fxRafId) {
    fxRafId = requestAnimationFrame(drawParticles);
  }
}

function drawParticles() {
  fxCtx.clearRect(0, 0, width, height);

  particles = particles.filter((particle) => {
    particle.x += particle.vx * 0.028;
    particle.y += particle.vy * 0.028;
    particle.life -= particle.decay;

    if (particle.life <= 0) {
      return false;
    }

    const opacity = Math.max(particle.life, 0);
    fxCtx.save();
    if (particle.isRipple) {
      const radius = 14 + (1 - particle.life) * 92;
      fxCtx.globalAlpha = opacity * 0.34;
      fxCtx.strokeStyle = "#c9eeff";
      fxCtx.lineWidth = 1.15;
      fxCtx.shadowColor = "#74cfff";
      fxCtx.shadowBlur = 13;
      fxCtx.beginPath();
      fxCtx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      fxCtx.stroke();
    } else {
      fxCtx.globalAlpha = opacity * (0.6 + Math.sin(particle.phase) * 0.14);
      fxCtx.fillStyle = "#d9f4ff";
      fxCtx.shadowColor = "#8fdaff";
      fxCtx.shadowBlur = 8;
      fxCtx.beginPath();
      fxCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      fxCtx.fill();
    }
    fxCtx.restore();

    return true;
  });

  if (particles.length > 0) {
    fxRafId = requestAnimationFrame(drawParticles);
  } else {
    fxRafId = null;
    fxCtx.clearRect(0, 0, width, height);
  }
}

function revealOnScroll() {
  const items = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  items.forEach((item) => observer.observe(item));
}

function initAccountDialog() {
  const accountCards = document.querySelectorAll("[data-account-title]");

  if (!accountCards.length) {
    return;
  }

  const dialog = document.createElement("div");
  dialog.className = "account-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-hidden", "true");
  dialog.innerHTML = `
    <div class="account-dialog-backdrop" data-account-close></div>
    <div class="account-dialog-panel">
      <button class="account-close" type="button" aria-label="关闭" data-account-close>×</button>
      <h3 class="account-dialog-title"></h3>
      <p class="account-dialog-value"></p>
      <div class="account-dialog-actions">
        <button class="button button-primary" type="button" data-account-copy>复制</button>
        <a class="button button-ghost" href="#" target="_blank" rel="noopener noreferrer" data-account-open>打开</a>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);

  const title = dialog.querySelector(".account-dialog-title");
  const value = dialog.querySelector(".account-dialog-value");
  const copyButton = dialog.querySelector("[data-account-copy]");
  const openLink = dialog.querySelector("[data-account-open]");
  const closeButtons = dialog.querySelectorAll("[data-account-close]");
  let activeValue = "";

  function closeDialog() {
    dialog.classList.remove("is-open");
    dialog.setAttribute("aria-hidden", "true");
  }

  accountCards.forEach((card) => {
    card.addEventListener("click", () => {
      activeValue = card.dataset.accountValue || "";
      const action = card.dataset.accountAction || "打开";
      const url = card.dataset.accountUrl || "";

      title.textContent = card.dataset.accountTitle || "账号";
      value.textContent = activeValue;
      copyButton.textContent = "复制";
      openLink.textContent = action;
      openLink.href = url || "#";
      openLink.style.display = url ? "inline-flex" : "none";
      dialog.classList.add("is-open");
      dialog.setAttribute("aria-hidden", "false");
      copyButton.focus();
    });
  });

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(activeValue);
      copyButton.textContent = "已复制";
    } catch {
      copyButton.textContent = "复制失败";
    }
  });

  closeButtons.forEach((button) => button.addEventListener("click", closeDialog));

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog.classList.contains("is-open")) {
      closeDialog();
    }
  });
}

function initLockedLinks() {
  const lockedLinks = document.querySelectorAll("[data-secret-id]");

  if (!lockedLinks.length) {
    return;
  }

  function closeLockDialog() {
    document.querySelector(".diary-lock-backdrop")?.remove();
  }

  function openLockDialog(link) {
    closeLockDialog();

    const titleText = link.dataset.lockedTitle || "私密入口";
    const descriptionText = link.dataset.lockedDescription || "这个入口已加锁，服务器验证通过后会打开对应页面。";
    const backdrop = document.createElement("div");
    backdrop.className = "diary-lock-backdrop";
    backdrop.innerHTML = `
      <form class="diary-lock-dialog" aria-label="${titleText}密码验证">
        <button class="diary-lock-close" type="button" aria-label="关闭">×</button>
        <p class="eyebrow">Protected Entry</p>
        <h2>${titleText}</h2>
        <p>${descriptionText}</p>
        <input id="locked-link-password" type="password" placeholder="请输入访问密码" autocomplete="current-password" />
        <div class="diary-lock-error" role="alert" aria-live="polite"></div>
        <button class="button button-primary" type="submit">解锁打开</button>
      </form>
    `;

    document.body.appendChild(backdrop);

    const form = backdrop.querySelector("form");
    const input = backdrop.querySelector("#locked-link-password");
    const error = backdrop.querySelector(".diary-lock-error");
    const closeButton = backdrop.querySelector(".diary-lock-close");
    const submitButton = backdrop.querySelector("button[type='submit']");

    input.focus();

    closeButton.addEventListener("click", closeLockDialog);
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        closeLockDialog();
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      error.textContent = "";
      submitButton.disabled = true;
      submitButton.textContent = "验证中";

      try {
        const response = await fetch(`${BLOG_PROXY_BASE}/api/private-link/unlock`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id: link.dataset.secretId,
            password: input.value.trim()
          })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.url) {
          error.textContent = data.message || "密码不正确，再试一次。";
          input.select();
          return;
        }

        window.open(data.url, "_blank", "noopener,noreferrer");
        closeLockDialog();
      } catch {
        error.textContent = "暂时无法连接服务器，请稍后再试。";
        input.select();
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "解锁打开";
      }
    });
  }

  lockedLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openLockDialog(link);
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLockDialog();
    }
  });
}

function initMeteors() {
  if (!document.body.classList.contains("home-page") || prefersReducedMotion) {
    return;
  }

  const field = document.createElement("div");
  field.className = "meteor-field";
  field.setAttribute("aria-hidden", "true");
  document.body.appendChild(field);

  function spawnMeteor() {
    const meteor = document.createElement("span");
    const top = Math.round(Math.random() * 26 + 8);
    const left = Math.round(Math.random() * 30 + 62);
    const length = Math.round(Math.random() * 90 + 120);
    const duration = (Math.random() * 0.55 + 0.9).toFixed(2);
    const opacity = (Math.random() * 0.18 + 0.68).toFixed(2);

    meteor.className = "meteor";
    meteor.style.setProperty("--meteor-top", `${top}vh`);
    meteor.style.setProperty("--meteor-left", `${left}vw`);
    meteor.style.setProperty("--meteor-length", `${length}px`);
    meteor.style.setProperty("--meteor-duration", `${duration}s`);
    meteor.style.setProperty("--meteor-opacity", opacity);
    field.appendChild(meteor);

    meteor.addEventListener("animationend", () => meteor.remove(), { once: true });
  }

  function scheduleMeteor() {
    const delay = Math.random() * 9000 + 7000;
    window.setTimeout(() => {
      spawnMeteor();
      scheduleMeteor();
    }, delay);
  }

  window.setTimeout(() => {
    spawnMeteor();
    scheduleMeteor();
  }, 2600);
}

function initFireflies() {
  if (prefersReducedMotion) {
    return;
  }

  const field = document.createElement("div");
  const isHome = document.body.classList.contains("home-page");
  const count = isHome ? 8 : 16;

  field.className = "firefly-field";
  field.setAttribute("aria-hidden", "true");

  for (let i = 0; i < count; i += 1) {
    const firefly = document.createElement("span");
    const size = Math.random() * 7 + 4;
    const top = Math.random() * 84 + 8;
    const left = Math.random() * 96 + 2;
    const driftX = (Math.random() - 0.5) * 150;
    const driftY = (Math.random() - 0.5) * 110;
    const duration = Math.random() * 12 + 14;
    const pulse = Math.random() * 3 + 2.8;
    const delay = Math.random() * -18;

    firefly.className = "firefly";
    firefly.style.setProperty("--firefly-size", `${size.toFixed(1)}px`);
    firefly.style.setProperty("--firefly-top", `${top.toFixed(1)}vh`);
    firefly.style.setProperty("--firefly-left", `${left.toFixed(1)}vw`);
    firefly.style.setProperty("--firefly-x", `${driftX.toFixed(1)}px`);
    firefly.style.setProperty("--firefly-y", `${driftY.toFixed(1)}px`);
    firefly.style.setProperty("--firefly-duration", `${duration.toFixed(1)}s`);
    firefly.style.setProperty("--firefly-pulse", `${pulse.toFixed(1)}s`);
    firefly.style.setProperty("--firefly-delay", `${delay.toFixed(1)}s`);
    field.appendChild(firefly);
  }

  document.body.appendChild(field);
}

const BLOG_PROXY_BASE = "https://api.gjsx.uno";

const ANALYTICS_ENDPOINT = `${BLOG_PROXY_BASE}/api/analytics/track`;

function getAnalyticsVisitorId() {
  const key = "zhiwu_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    localStorage.setItem(key, id);
  }
  return id;
}

function sendAnalyticsEvent(payload) {
  const body = JSON.stringify({
    site: "zhiwu-blog",
    type: payload.type,
    path: location.pathname || "/",
    pageTitle: document.title,
    href: payload.href || "",
    label: payload.label || "",
    projectId: payload.projectId || "",
    visitorId: getAnalyticsVisitorId(),
    time: new Date().toISOString(),
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      ANALYTICS_ENDPOINT,
      new Blob([body], { type: "application/json" })
    );
    return;
  }

  fetch(ANALYTICS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

function initAnalytics() {
  sendAnalyticsEvent({ type: "pageview" });

  document.addEventListener("click", (event) => {
    const target = event.target.closest("a, button");
    if (!target) return;

    sendAnalyticsEvent({
      type: "click",
      label: (target.textContent || target.title || "unknown")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 100),
      href: target.href || "",
    projectId: (target.closest("[data-star-id]") || target).dataset.starId || "",
    });
  });
}

function setStatusText(root, selector, value) {
  const node = root.querySelector(selector);
  if (node) {
    node.textContent = value;
  }
}

function formatStatusTime(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}


const PROJECT_STARS_FALLBACK = "assets/project-stars.json";
const PROJECT_STARS_STATUS_ENDPOINT = `${BLOG_PROXY_BASE}/api/project-stars`;
const RECENT_UPDATES_ENDPOINT = "https://api.github.com/repos/ningyan1228/zhiwu-blog/commits?per_page=3";

function clampProjectStar(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function daysSinceProjectUpdate(value) {
  if (!value) return 999;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 999;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
}

function getProjectStarBrightness(star) {
  const activity = clampProjectStar(star.activity, 0, 100) / 100;
  const freshness = Math.max(0.22, 1 - daysSinceProjectUpdate(star.lastUpdated) / 45);
  const health = star.status === "online" ? 1 : star.status === "checking" ? 0.62 : star.status === "static" ? 0.72 : 0.38;
  return Math.max(0.28, Math.min(1, activity * 0.42 + freshness * 0.34 + health * 0.24));
}

function getProjectStarStatusText(star) {
  if (star.status === "online") return "在线";
  if (star.status === "offline") return "离线";
  if (star.status === "static") return "静态星";
  if (star.status === "checking") return "检测中";
  return star.healthUrl ? "待检测" : "静态星";
}

function getProjectStarTime(value) {
  if (!value) return "未记录";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

async function fetchProjectStarJson(url, options = {}) {
  const response = await fetch(url, { cache: "no-store", ...options });
  if (!response.ok) throw new Error(`Request failed: ${url}`);
  return response.json();
}

async function fetchProjectStarHealth(star) {
  if (!star.healthUrl) return { ...star, status: star.status || "static" };

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3600);

  try {
    const startedAt = performance.now();
    const response = await fetch(star.healthUrl, {
      cache: "no-store",
      mode: "no-cors",
      signal: controller.signal
    });
    const latency = Math.round(performance.now() - startedAt);
    if (!response.ok && response.type !== "opaque") throw new Error("health failed");
    return {
      ...star,
      status: "online",
      latency,
      checkedAt: new Date().toISOString()
    };
  } catch {
    return {
      ...star,
      status: star.status || "offline",
      checkedAt: new Date().toISOString()
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

function mergeProjectStarStatus(stars, remoteItems) {
  if (!Array.isArray(remoteItems) || !remoteItems.length) return stars;
  const remoteById = new Map(remoteItems.map((item) => [item.id || item.name, item]));
  return stars.map((star) => ({ ...star, ...(remoteById.get(star.id) || remoteById.get(star.name) || {}) }));
}

function renderProjectStars(stars, sourceLabel = "本地星图", metrics = {}) {
  const root = document.querySelector("[data-project-stars]");
  if (!root) return;

  const map = root.querySelector("[data-star-map]");
  const panel = root.querySelector("[data-star-panel]");
  if (!map) return;

  const normalizedStars = stars.map((star) => ({
    ...star,
    status: star.status || (star.healthUrl ? "checking" : "static"),
    brightness: getProjectStarBrightness(star)
  }));

  const starLimit = Number(root.dataset.starLimit || 0);
  const visibleStars = starLimit > 0 ? normalizedStars.slice(0, starLimit) : normalizedStars;

  map.innerHTML = visibleStars.map((star, index) => {
    const starScale = Math.max(0.5, Number(root.dataset.starScale || 1));
    const size = Math.round((42 + Math.round(star.brightness * 28)) * starScale);
    const glow = 0.45 + star.brightness * 0.75;
    const style = [
      `--star-x:${clampProjectStar(star.x ?? 50, 8, 92)}%`,
      `--star-y:${clampProjectStar(star.y ?? 50, 10, 88)}%`,
      `--star-size:${size}px`,
      `--star-glow:${glow}`,
      `--star-delay:${index * 0.18}s`
    ].join(";");

    return `
      <a class="project-star project-star-${star.tone || "blue"} is-${star.status}" href="${star.url}" target="_blank" rel="noopener noreferrer" style="${style}" data-star-id="${star.id}">
        <span class="project-star-core"></span>
        <span class="project-star-name">${star.name}</span>
      </a>
    `;
  }).join("");

  if (!panel) return;

  const onlineCount = visibleStars.filter((star) => star.status === "online").length;
  const visitorsToday = Number(metrics.visitorsToday || metrics.uniqueVisitorsToday || 0);
  const fallbackDust = visibleStars.reduce((sum, star) => sum + Number(star.visitsToday || 0), 0);
  const dustCount = visitorsToday || fallbackDust;
  const dustLabel = dustCount > 0 ? `今日有 ${dustCount} 粒星尘经过` : "今日星尘正在汇聚";

  panel.innerHTML = `
    <span class="constellation-status">${sourceLabel} · ${onlineCount}/${visibleStars.length} 在线</span>
    <div class="constellation-dust" aria-live="polite">
      <span></span>
      <strong>${dustLabel}</strong>
    </div>
    <h3>星图状态</h3>
    <p>最近更新和访问更活跃的项目会更亮；点击任意星星都会留下今日星尘。</p>
    <div class="constellation-meta">
      ${visibleStars.map((star) => `
        <a href="${star.url}" target="_blank" rel="noopener noreferrer" data-star-id="${star.id}">
          <span>${star.kind || "项目星"}</span>
          <strong>${star.name}</strong>
          <em>${getProjectStarStatusText(star)} · ${star.visitsToday || 0} 粒星尘 · ${getProjectStarTime(star.lastUpdated)}</em>
        </a>
      `).join("")}
    </div>
  `;
}

async function initProjectStars() {
  const root = document.querySelector("[data-project-stars]");
  if (!root) return;

  let stars = [];
  try {
    stars = await fetchProjectStarJson(PROJECT_STARS_FALLBACK);
  } catch {
    return;
  }

  renderProjectStars(stars, "本地星图");

  try {
    const remote = await fetchProjectStarJson(PROJECT_STARS_STATUS_ENDPOINT);
    const remoteItems = Array.isArray(remote) ? remote : remote.items;
    stars = mergeProjectStarStatus(stars, remoteItems);
    renderProjectStars(stars, "服务器星图", remote);
    return;
  } catch {
    // The unified server endpoint can be added later; per-star health checks keep the map useful now.
  }

  const checkedStars = await Promise.all(stars.map(fetchProjectStarHealth));
  renderProjectStars(checkedStars, "Health 自动检测");
}

function formatRecentUpdateDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "近期";

  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date).replace(/\//g, "-");
}

function localizeRecentUpdateTitle(value) {
  const titles = {
    "Load real recent updates and fix light contrast": "加载真实更新记录并优化浅色模式对比度",
    "Clarify project preview link": "明确项目预览跳转入口",
    "Streamline homepage and glass materials": "精简首页结构并统一玻璃材质",
    "Blend homepage hero backgrounds": "优化首页晨曦与夜景背景过渡",
    "Fix homepage light contrast": "修复首页浅色模式文字对比度",
    "Assign section wallpapers": "为网站栏目配置专属壁纸"
  };

  return titles[value] || value || "网站更新";
}

function createRecentUpdateCard(update) {
  const card = document.createElement("a");
  const date = document.createElement("span");
  const title = document.createElement("h3");
  const summary = document.createElement("p");

  card.className = "glass-card recent-card";
  card.href = update.url;
  if (/^https?:\/\//.test(update.url)) {
    card.target = "_blank";
    card.rel = "noopener noreferrer";
  }

  date.className = "recent-date";
  date.textContent = formatRecentUpdateDate(update.date);
  title.textContent = update.title;
  summary.textContent = update.summary;
  card.append(date, title, summary);
  return card;
}

function renderRecentUpdates(root, updates) {
  root.replaceChildren(...updates.slice(0, 3).map(createRecentUpdateCard));
}

async function loadArticleUpdateFallback() {
  const response = await fetch("articles.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Article index request failed");

  const articles = await response.json();
  if (!Array.isArray(articles) || !articles.length) throw new Error("No article updates available");

  return [...articles]
    .sort((left, right) => new Date(right.date) - new Date(left.date))
    .slice(0, 3)
    .map((article) => ({
      date: article.date,
      title: article.title || "新文章发布",
      summary: article.excerpt || "已发布新的文章内容。",
      url: `articles/${article.slug}.html`
    }));
}

async function initRecentUpdates() {
  const root = document.querySelector("[data-recent-updates]");
  if (!root) return;

  try {
    const response = await fetch(RECENT_UPDATES_ENDPOINT, {
      cache: "no-store",
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!response.ok) throw new Error("GitHub updates request failed");

    const commits = await response.json();
    if (!Array.isArray(commits) || !commits.length) throw new Error("No GitHub updates available");

    renderRecentUpdates(root, commits.map((commit) => ({
      date: commit.commit?.author?.date || commit.commit?.committer?.date,
      title: localizeRecentUpdateTitle(commit.commit?.message?.split("\n")[0]),
      summary: "来自 GitHub 仓库的实际更新记录。",
      url: commit.html_url || "https://github.com/ningyan1228/zhiwu-blog/commits/main"
    })));
  } catch {
    try {
      renderRecentUpdates(root, await loadArticleUpdateFallback());
    } catch {
      root.innerHTML = '<div class="glass-card recent-card"><span class="recent-date">暂无更新</span><h3>更新记录暂不可用</h3><p>请稍后刷新页面重试。</p></div>';
    }
  }
}

async function initSiteStatus() {
  const panel = document.querySelector("[data-site-status-panel]");
  if (!panel) return;

  const pill = panel.querySelector("[data-status-pill]");
  const setPill = (text, state) => {
    if (!pill) return;
    pill.textContent = text;
    pill.classList.remove("is-loading", "is-ok", "is-error");
    pill.classList.add(state);
  };

  try {
    const [statusRes, versionRes] = await Promise.all([
      fetch(`${BLOG_PROXY_BASE}/api/status`, { cache: "no-store" }),
      fetch(`${BLOG_PROXY_BASE}/api/version`, { cache: "no-store" })
    ]);

    if (!statusRes.ok || !versionRes.ok) {
      throw new Error("Proxy status request failed");
    }

    const status = await statusRes.json();
    const version = await versionRes.json();

    setStatusText(panel, "[data-status-frontend]", status.frontend || "GitHub Pages");
    setStatusText(panel, "[data-status-proxy]", status.proxy || status.service || "Tencent Cloud Proxy");
    setStatusText(panel, "[data-status-version]", version.version || "--");
    setStatusText(panel, "[data-status-time]", formatStatusTime(status.time || version.updatedAt));
    setStatusText(panel, "[data-status-message]", status.message || "代理服务运行正常，前端已接入腾讯云。");
    setPill("运行正常", "is-ok");
  } catch (error) {
    setStatusText(panel, "[data-status-proxy]", "连接失败");
    setStatusText(panel, "[data-status-message]", "暂时无法连接代理服务，GitHub Pages 静态页面仍可正常浏览。");
    setPill("连接异常", "is-error");
  }
}

function initAdminEasterEgg() {
  if (!document.body.classList.contains("home-page")) {
    return;
  }

  const brand = document.querySelector(".brand");
  if (!brand) {
    return;
  }

  let taps = 0;
  let timer = null;

  brand.addEventListener("click", (event) => {
    event.preventDefault();
    taps += 1;

    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      taps = 0;
    }, 2600);

    if (taps >= 5) {
      window.clearTimeout(timer);
      taps = 0;
      window.location.href = "admin/";
    }
  });
}

function initSystemIcons() {
  const paths = {
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 0 4 24.5V4.5A2.5 2.5 0 0 1 6.5 2Z"/>',
    folder: '<path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5Z"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-4.5-4.5L7 20"/>',
    bot: '<rect x="4" y="7" width="16" height="13" rx="3"/><path d="M12 3v4M8 13h.01M16 13h.01M8 17h8"/>',
    headphones: '<path d="M4 14a8 8 0 0 1 16 0"/><path d="M4 14v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 1ZM20 14v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 1Z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15"/><path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
    code: '<path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/>',
    language: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    brain: '<path d="M9.5 4.5A3.5 3.5 0 0 0 5 7.8 3.6 3.6 0 0 0 5.8 15 3.6 3.6 0 0 0 12 17.5V5.2A3.5 3.5 0 0 0 9.5 4.5Z"/><path d="M14.5 4.5A3.5 3.5 0 0 1 19 7.8 3.6 3.6 0 0 1 18.2 15 3.6 3.6 0 0 1 12 17.5M8 9.5h4M12 13h4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01"/>',
    map: '<path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3Z"/><path d="M9 3v15M15 6v15"/>',
    trophy: '<path d="M8 4h8v4a4 4 0 0 1-8 0Z"/><path d="M8 6H5v1a4 4 0 0 0 4 4M16 6h3v1a4 4 0 0 1-4 4M12 12v5M8 21h8"/>',
    sliders: '<path d="M4 6h16M4 12h16M4 18h16"/><path d="M8 4v4M16 10v4M11 16v4"/>',
    palette: '<path d="M12 3a9 9 0 0 0 0 18h1.2a1.8 1.8 0 0 0 0-3.6h-.8a1.8 1.8 0 0 1 0-3.6H15a6 6 0 0 0-3-10.8Z"/><path d="M7.5 10h.01M9.5 6.8h.01M14.5 7h.01M17 10h.01"/>',
    newspaper: '<path d="M4 5h14a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2Z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    smartphone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>'
  };
  const toSvg = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name] || paths.file}</svg>`;
  const replace = (selector, names) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.innerHTML = toSvg(names[index % names.length]);
      element.setAttribute("aria-hidden", "true");
    });
  };

  document.querySelectorAll(".theme-toggle-sun").forEach((element) => {
    element.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  });

  document.querySelectorAll(".theme-toggle-moon").forEach((element) => {
    element.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.2 14.4A8.5 8.5 0 0 1 9.6 3.8 8.5 8.5 0 1 0 20.2 14.4Z"/></svg>';
  });

  replace("#project-finder .project-icon", ["book", "book", "image", "bot", "headphones", "file", "link", "folder", "image", "file"]);
  replace("#tool-finder .project-icon", ["calendar", "trophy", "map", "image", "folder", "file", "map", "map", "bot", "brain", "newspaper", "book", "smartphone", "link", "sliders", "palette"]);
  replace(".practice-folder-icon", ["file", "code", "language", "book"]);
  replace(".knowledge-card .card-icon", ["book", "file", "newspaper", "book", "brain", "code", "book", "file", "smartphone", "folder"]);
}

initSystemIcons();
initTheme();
resizeCanvas();
drawStars();
revealOnScroll();
initAccountDialog();
initLockedLinks();
initFireflies();
initMeteors();
initSiteStatus();
initProjectStars();
initRecentUpdates();
initAnalytics();

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
    try {
      localStorage.setItem("theme", nextTheme);
    } catch {
      // Theme still changes for the current page when storage is unavailable.
    }
    setTheme(nextTheme);
  });
}

window.addEventListener("resize", () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
  resizeCanvas();
  drawStars();
});

window.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 && event.pointerType === "mouse") {
    return;
  }

  burstAt(event.clientX, event.clientY);
});

/* Full-site command palette: builds its index from the site's existing content sources. */
function initCommandPalette() {
  const header = document.querySelector(".site-header");
  const themeButton = document.querySelector(".theme-toggle");
  if (!header || !themeButton || document.querySelector("[data-command-trigger]")) return;

  const mainScript = [...document.scripts].find((script) => /assets\/main\.js/.test(script.src));
  const siteRoot = new URL("../", mainScript?.src || window.location.href);
  const shortcut = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent) ? "\u2318 K" : "Ctrl K";
  const trigger = document.createElement("button");
  trigger.className = "command-trigger";
  trigger.type = "button";
  trigger.dataset.commandTrigger = "";
  trigger.setAttribute("aria-label", `\u6253\u5f00\u5168\u7ad9\u641c\u7d22\uff08${shortcut}\uff09`);
  trigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.2 4.2"></path></svg><span>\u641c\u7d22</span><kbd>' + shortcut + '</kbd>';
  header.insertBefore(trigger, themeButton);

  const palette = document.createElement("div");
  palette.className = "command-palette";
  palette.hidden = true;
  palette.innerHTML = [
    '<div class="command-palette-backdrop" data-command-close></div>',
    '<section class="command-palette-dialog" role="dialog" aria-modal="true" aria-labelledby="command-palette-title">',
    '  <div class="command-searchbar">',
    '    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.2 4.2"></path></svg>',
    '    <input type="search" autocomplete="off" placeholder="\u641c\u7d22\u6587\u7ae0\u3001\u9879\u76ee\u3001\u7b14\u8bb0\u3001\u5de5\u5177\u2026" aria-label="\u5168\u7ad9\u641c\u7d22" data-command-input />',
    '    <kbd>Esc</kbd>',
    '  </div>',
    '  <div class="command-results" data-command-results aria-live="polite"></div>',
    '  <footer class="command-palette-footer"><span><kbd>&#8593;&#8595;</kbd> \u9009\u62e9</span><span><kbd>&#8629;</kbd> \u6253\u5f00</span><span>\u5168\u7ad9\u641c\u7d22</span></footer>',
    '</section>'
  ].join("");
  document.body.append(palette);

  const input = palette.querySelector("[data-command-input]");
  const resultsRoot = palette.querySelector("[data-command-results]");
  let items = [];
  let selectedIndex = 0;
  let previousFocus = null;
  let indexPromise = null;

  const builtinItems = [
    { title: "\u8fd4\u56de\u9996\u9875", description: "\u6253\u5f00\u4e2a\u4eba\u6570\u5b57\u82b1\u56ed\u9996\u9875", type: "\u547d\u4ee4", url: new URL("./", siteRoot).href, keywords: "\u9996\u9875 \u4e2a\u4eba\u535a\u5ba2 \u6570\u5b57\u82b1\u56ed" },
    { title: "\u67e5\u770b\u6700\u65b0\u6587\u7ae0", description: "\u6d4f\u89c8\u5efa\u7ad9\u3001\u9605\u8bfb\u4e0e\u5b66\u4e60\u8bb0\u5f55", type: "\u547d\u4ee4", url: new URL("articles/", siteRoot).href, keywords: "\u6587\u7ae0 \u6700\u65b0 \u5199\u4f5c \u9605\u8bfb" },
    { title: "\u6253\u5f00\u9879\u76ee\u661f\u56fe", description: "\u67e5\u770b\u8fd1\u671f\u6d3b\u8dc3\u7684\u91cd\u70b9\u9879\u76ee", type: "\u547d\u4ee4", url: new URL("#project-constellation", siteRoot).href, keywords: "\u661f\u56fe \u9879\u76ee \u4f5c\u54c1" },
    { title: "\u6253\u5f00\u5b66\u4e60\u8d44\u6599\u5e93", description: "\u516c\u8003\u3001\u8003\u7f16\u4e0e\u5b66\u4e60\u8d44\u6599\u6574\u7406\u5165\u53e3", type: "\u547d\u4ee4", url: "https://ningyan1228.github.io/study-resource-library/", keywords: "\u5b66\u4e60\u8d44\u6599\u5e93 \u516c\u8003 \u8003\u7f16 \u6587\u6863" },
    { title: "\u8fdb\u5165\u77e5\u8bc6\u5e93", description: "\u9605\u8bfb\u3001\u5b66\u4e60\u4e0e\u521b\u4f5c\u7b14\u8bb0", type: "\u547d\u4ee4", url: new URL("knowledge/", siteRoot).href, keywords: "\u77e5\u8bc6\u5e93 \u7b14\u8bb0 notion" },
    { title: "\u8054\u7cfb\u6211", description: "\u67e5\u770b\u8054\u7cfb\u65b9\u5f0f\u4e0e\u534f\u4f5c\u5165\u53e3", type: "\u547d\u4ee4", url: new URL("contact/", siteRoot).href, keywords: "\u8054\u7cfb \u90ae\u7bb1 \u5173\u4e8e\u6211" }
  ];

  const normalize = (value = "") => value.toLocaleLowerCase("zh-CN").replace(/\s+/g, " ").trim();
  const isExternal = (url) => {
    try {
      return new URL(url, window.location.href).origin !== window.location.origin;
    } catch {
      return false;
    }
  };

  const toItem = ({ title, description, type, url, keywords = "" }) => {
    if (!title || !url || url === "#") return null;
    return {
      title: title.trim(),
      description: (description || "").replace(/\s+/g, " ").trim(),
      type,
      url: new URL(url, siteRoot).href,
      keywords,
      external: isExternal(url)
    };
  };

  const extractCards = (html, sourceUrl, selector, type) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return [...doc.querySelectorAll(selector)].map((card) => {
      const link = card.matches("a[href]") ? card : card.querySelector('a[href]:not([href="#"])');
      const title = card.querySelector("h2")?.textContent || link?.textContent;
      return toItem({
        title,
        description: card.textContent,
        type,
        url: link?.getAttribute("href") ? new URL(link.getAttribute("href"), sourceUrl).href : "",
        keywords: card.querySelector(".project-kind, .knowledge-tags, .project-meta")?.textContent || ""
      });
    }).filter(Boolean);
  };

  const fetchText = async (path) => {
    const response = await fetch(new URL(path, siteRoot), { cache: "no-store" });
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    return response.text();
  };

  const buildIndex = async () => {
    const collected = [...builtinItems];
    const [articles, stars, toolsPage, knowledgePage, practicePage] = await Promise.allSettled([
      fetchText("articles.json").then(JSON.parse),
      fetchText("assets/project-stars.json").then(JSON.parse),
      fetchText("tools/"),
      fetchText("knowledge/"),
      fetchText("practice/")
    ]);

    if (articles.status === "fulfilled" && Array.isArray(articles.value)) {
      collected.push(...articles.value.map((article) => toItem({
        title: article.title,
        description: article.excerpt,
        type: "\u6587\u7ae0",
        url: `articles/${article.slug}.html`,
        keywords: [article.category, ...(article.tags || [])].join(" ")
      })).filter(Boolean));
    }

    if (stars.status === "fulfilled" && Array.isArray(stars.value)) {
      collected.push(...stars.value.map((star) => toItem({
        title: star.name,
        description: star.description || star.kind,
        type: "\u9879\u76ee",
        url: star.url,
        keywords: [star.kind, star.tone, star.id].join(" ")
      })).filter(Boolean));
    }

    if (toolsPage.status === "fulfilled") collected.push(...extractCards(toolsPage.value, new URL("tools/", siteRoot), ".finder-project-card", "\u5de5\u5177"));
    if (knowledgePage.status === "fulfilled") collected.push(...extractCards(knowledgePage.value, new URL("knowledge/", siteRoot), ".knowledge-card:not(.is-locked)", "\u77e5\u8bc6\u5e93"));
    if (practicePage.status === "fulfilled") {
      collected.push(...extractCards(practicePage.value, new URL("practice/", siteRoot), ".practice-folder", "\u5b66\u4e60"));
      collected.push(...extractCards(practicePage.value, new URL("practice/", siteRoot), ".practice-subcard", "\u5b66\u4e60\u5165\u53e3"));
    }

    const seen = new Set();
    return collected.filter((item) => {
      const key = `${item.title}|${item.url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const rankItems = (query) => {
    const needle = normalize(query);
    if (!needle) return builtinItems.map((item) => ({ ...item, external: isExternal(item.url) }));
    return items.map((item) => {
      const title = normalize(item.title);
      const haystack = normalize(`${item.title} ${item.description} ${item.type} ${item.keywords}`);
      const score = title === needle ? 100 : title.startsWith(needle) ? 70 : haystack.includes(needle) ? 35 : 0;
      return { ...item, score };
    }).filter((item) => item.score > 0).sort((left, right) => right.score - left.score || left.title.localeCompare(right.title, "zh-CN")).slice(0, 9);
  };

  const openItem = (item) => {
    if (!item) return;
    if (item.external) {
      window.open(item.url, "_blank", "noopener,noreferrer");
      return;
    }
    window.location.assign(item.url);
  };

  const render = () => {
    const matches = rankItems(input.value);
    selectedIndex = Math.min(selectedIndex, Math.max(matches.length - 1, 0));
    resultsRoot.replaceChildren();

    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "command-empty";
      empty.textContent = "\u6ca1\u6709\u627e\u5230\u5339\u914d\u5185\u5bb9\uff0c\u8bd5\u8bd5\u201c\u9879\u76ee\u201d\u3001\u201c\u516c\u8003\u201d\u6216\u201c\u9605\u8bfb\u201d\u3002";
      resultsRoot.append(empty);
      return;
    }

    const label = document.createElement("p");
    label.className = "command-result-label";
    label.textContent = input.value.trim() ? `\u627e\u5230 ${matches.length} \u6761\u7ed3\u679c` : "\u5e38\u7528\u547d\u4ee4";
    resultsRoot.append(label);

    matches.forEach((item, index) => {
      const button = document.createElement("button");
      const meta = document.createElement("span");
      const copy = document.createElement("span");
      const title = document.createElement("strong");
      const description = document.createElement("small");
      button.type = "button";
      button.className = "command-result";
      button.dataset.commandResult = String(index);
      button.classList.toggle("is-active", index === selectedIndex);
      meta.className = "command-result-type";
      meta.textContent = item.type;
      title.textContent = item.title;
      description.textContent = item.description || "\u6253\u5f00\u6b64\u5165\u53e3";
      copy.append(title, description);
      button.append(meta, copy);
      button.addEventListener("mouseenter", () => {
        selectedIndex = index;
        resultsRoot.querySelectorAll(".command-result").forEach((result, resultIndex) => result.classList.toggle("is-active", resultIndex === index));
      });
      button.addEventListener("click", () => openItem(item));
      resultsRoot.append(button);
    });
  };

  const loadIndex = () => {
    if (!indexPromise) {
      indexPromise = buildIndex().then((nextItems) => {
        items = nextItems;
      }).catch(() => {
        items = builtinItems.map((item) => ({ ...item, external: isExternal(item.url) }));
      }).finally(render);
    }
    return indexPromise;
  };

  const open = () => {
    if (!palette.hidden) return;
    previousFocus = document.activeElement;
    palette.hidden = false;
    document.body.classList.add("command-palette-open");
    selectedIndex = 0;
    render();
    window.setTimeout(() => input.focus(), 0);
    loadIndex();
  };

  const close = () => {
    if (palette.hidden) return;
    palette.hidden = true;
    document.body.classList.remove("command-palette-open");
    input.value = "";
    previousFocus?.focus?.();
  };

  trigger.addEventListener("click", open);
  palette.querySelector("[data-command-close]").addEventListener("click", close);
  input.addEventListener("input", () => {
    selectedIndex = 0;
    render();
  });

  document.addEventListener("keydown", (event) => {
    const shortcutPressed = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    if (shortcutPressed) {
      event.preventDefault();
      palette.hidden ? open() : close();
      return;
    }
    if (palette.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const count = resultsRoot.querySelectorAll(".command-result").length;
      if (!count) return;
      selectedIndex = (selectedIndex + (event.key === "ArrowDown" ? 1 : -1) + count) % count;
      render();
    } else if (event.key === "Enter") {
      const matches = rankItems(input.value);
      openItem(matches[selectedIndex]);
    }
  });
}

initCommandPalette();

function initHomeTimeScene() {
  if (!document.body.classList.contains("home-page")) return;

  const updateScene = () => {
    const hour = new Date().getHours();
    const scene = hour >= 5 && hour < 9
      ? "dawn"
      : hour >= 9 && hour < 17
        ? "day"
        : hour >= 17 && hour < 20
          ? "dusk"
          : "night";
    document.body.dataset.timeScene = scene;
  };

  updateScene();
  window.setInterval(updateScene, 60000);
}

function initPageTransitions() {
  if (prefersReducedMotion) return;

  const veil = document.createElement("div");
  veil.className = "page-transition-veil";
  veil.setAttribute("aria-hidden", "true");
  document.body.append(veil);

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest("a[href]");
    if (!link || link.target || link.hasAttribute("download")) return;

    const destination = new URL(link.href, window.location.href);
    const current = new URL(window.location.href);
    const isSameDocument = destination.origin === current.origin
      && destination.pathname === current.pathname
      && destination.search === current.search;

    if (destination.origin !== current.origin || isSameDocument) return;

    event.preventDefault();
    veil.style.setProperty("--transition-x", `${event.clientX}px`);
    veil.style.setProperty("--transition-y", `${event.clientY}px`);
    veil.classList.remove("is-active");
    requestAnimationFrame(() => veil.classList.add("is-active"));

    window.setTimeout(() => {
      window.location.assign(destination.href);
    }, 240);
  }, true);
}

initHomeTimeScene();
initPageTransitions();

