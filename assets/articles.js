const articleList = document.querySelector("#articles");
const articleContent = document.querySelector("#article-content");

function getArticleSlug() {
  const explicitSlug = document.body.dataset.articleSlug || new URLSearchParams(window.location.search).get("slug");
  if (explicitSlug) {
    return explicitSlug;
  }

  const fileSlug = window.location.pathname.split("/").pop()?.replace(".html", "");
  return fileSlug && !["index", "post"].includes(fileSlug) ? fileSlug : null;
}

const articleSlug = getArticleSlug();

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderFallbackMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
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

  if (listOpen) {
    html.push("</ul>");
  }

  return html.join("");
}

async function loadArticleData() {
  const response = await fetch("../articles.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("文章索引加载失败");
  }
  return response.json();
}

function getPublicArticles(articles) {
  return Array.isArray(articles) ? articles.filter((article) => article.status !== "draft") : [];
}

function articleMeta(article) {
  return `${article.date} · ${article.category} · ${article.readTime} min read`;
}

async function renderArticleList() {
  if (!articleList) {
    return;
  }

  try {
    const articles = getPublicArticles(await loadArticleData());
    articleList.innerHTML = articles
      .map((article) => {
        const tags = (article.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");

        return `
          <article class="glass-card article-card reveal is-visible">
            <a href="post.html?slug=${encodeURIComponent(article.slug)}">
              <p class="article-card-meta">${escapeHtml(articleMeta(article))}</p>
              <h2>${escapeHtml(article.title)}</h2>
              <p>${escapeHtml(article.excerpt)}</p>
              <div class="article-tags">${tags}</div>
            </a>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    articleList.innerHTML = `<div class="article-empty">${escapeHtml(error.message)}</div>`;
  }
}

async function renderArticleDetail() {
  if (!articleContent) {
    return;
  }

  if (!articleSlug) {
    articleContent.innerHTML = "<p>请从文章列表进入具体文章。</p>";
    return;
  }

  try {
    const articles = getPublicArticles(await loadArticleData());
    const article = articles.find((item) => item.slug === articleSlug);
    const markdownResponse = await fetch(`../posts/${articleSlug}.md`, { cache: "no-store" });

    if (!article || !markdownResponse.ok) {
      throw new Error("文章不存在或 Markdown 文件缺失");
    }

    const markdown = await markdownResponse.text();
    const parser = window.marked?.parse ? window.marked.parse.bind(window.marked) : renderFallbackMarkdown;

    document.title = `${article.title} | 止鹜个人博客`;
    document.querySelector("#article-title").textContent = article.title;
    document.querySelector("#article-category").textContent = article.category;
    document.querySelector("#article-meta").textContent = articleMeta(article);
    articleContent.innerHTML = parser(markdown);
  } catch (error) {
    articleContent.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  }
}

function initArticles() {
  renderArticleList();
  renderArticleDetail();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initArticles);
} else {
  initArticles();
}
