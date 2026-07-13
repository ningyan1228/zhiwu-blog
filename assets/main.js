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

  const colors = ["#6c8cff", "#a78bfa", "#61dafb", "#f472b6", "#fb7185", "#f8fafc"];
  const count = 22;

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    const isShard = Math.random() > 0.42;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 2.4,
      gravity: 0.13 + Math.random() * 0.05,
      life: 1,
      decay: 0.018 + Math.random() * 0.018,
      size: Math.random() * 6 + 3,
      stretch: isShard ? Math.random() * 1.8 + 1.5 : 1,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.24,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  if (!fxRafId) {
    fxRafId = requestAnimationFrame(drawParticles);
  }
}

function drawParticles() {
  fxCtx.clearRect(0, 0, width, height);

  particles = particles.filter((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += particle.gravity;
    particle.vx *= 0.985;
    particle.vy *= 0.985;
    particle.rotation += particle.spin;
    particle.life -= particle.decay;

    if (particle.life <= 0) {
      return false;
    }

    fxCtx.save();
    fxCtx.globalAlpha = Math.max(particle.life, 0);
    fxCtx.translate(particle.x, particle.y);
    fxCtx.rotate(particle.rotation);
    fxCtx.shadowColor = particle.color;
    fxCtx.shadowBlur = 14;
    fxCtx.fillStyle = particle.color;
    fxCtx.beginPath();
    fxCtx.ellipse(
      0,
      0,
      particle.size * particle.stretch,
      particle.size,
      0,
      0,
      Math.PI * 2
    );
    fxCtx.fill();
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
    const size = 42 + Math.round(star.brightness * 28);
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
