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

initTheme();
resizeCanvas();
drawStars();
revealOnScroll();
initAccountDialog();
initFireflies();
initMeteors();

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
