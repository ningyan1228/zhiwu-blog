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

initTheme();
resizeCanvas();
drawStars();
revealOnScroll();

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
