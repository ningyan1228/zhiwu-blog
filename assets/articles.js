const articleList = document.querySelector("#articles");
const articleContent = document.querySelector("#article-content");
const articleFilters = {
  series: "all",
  tag: "all",
  query: "",
};

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

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function sortArticles(articles) {
  return [...articles].sort((a, b) => {
    const pinned = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
    if (pinned) return pinned;
    return String(b.date || "").localeCompare(String(a.date || ""));
  });
}

function getFilteredArticles(articles) {
  const query = articleFilters.query.trim().toLowerCase();
  return sortArticles(articles)
    .filter((article) => articleFilters.series === "all" || article.series === articleFilters.series)
    .filter((article) => articleFilters.tag === "all" || (article.tags || []).includes(articleFilters.tag))
    .filter((article) => {
      if (!query) return true;
      return [article.title, article.excerpt, article.category, article.series, article.slug]
        .some((value) => String(value || "").toLowerCase().includes(query));
    });
}

function renderArticleFilters(articles) {
  const series = uniqueSorted(articles.map((article) => article.series || ""));
  const tags = uniqueSorted(articles.flatMap((article) => article.tags || []));
  return `
    <div class="article-filter-bar" aria-label="文章筛选">
      <label>
        <span>系列</span>
        <select data-public-series-filter>
          <option value="all">全部系列</option>
          ${series.map((item) => `<option value="${escapeHtml(item)}"${item === articleFilters.series ? " selected" : ""}>${escapeHtml(item)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>标签</span>
        <select data-public-tag-filter>
          <option value="all">全部标签</option>
          ${tags.map((item) => `<option value="${escapeHtml(item)}"${item === articleFilters.tag ? " selected" : ""}>${escapeHtml(item)}</option>`).join("")}
        </select>
      </label>
      <label>
        <span>搜索</span>
        <input type="search" value="${escapeHtml(articleFilters.query)}" placeholder="标题 / 摘要 / slug" data-public-article-search />
      </label>
    </div>
  `;
}

async function renderArticleList() {
  if (!articleList) {
    return;
  }

  try {
    const articles = getPublicArticles(await loadArticleData());
    const filteredArticles = getFilteredArticles(articles);
    articleList.innerHTML = `
      ${renderArticleFilters(articles)}
      <div class="article-list-grid">
        ${filteredArticles.length ? filteredArticles
      .map((article) => {
        const tags = (article.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");

        return `
          <article class="glass-card article-card reveal is-visible">
            <a href="post.html?slug=${encodeURIComponent(article.slug)}">
              ${article.coverImage ? `<img class="article-card-cover" src="${escapeHtml(article.coverImage)}" alt="" loading="lazy" />` : ""}
              <p class="article-card-meta">${escapeHtml(articleMeta(article))}</p>
              <div class="article-card-badges">
                ${article.pinned ? "<span>置顶</span>" : ""}
                ${article.series ? `<span>${escapeHtml(article.series)}</span>` : ""}
              </div>
              <h2>${escapeHtml(article.title)}</h2>
              <p>${escapeHtml(article.excerpt)}</p>
              <div class="article-tags">${tags}</div>
            </a>
          </article>
        `;
      })
      .join("") : `<div class="article-empty">没有符合筛选条件的文章。</div>`}
      </div>
    `;
    bindArticleFilters();
  } catch (error) {
    articleList.innerHTML = `<div class="article-empty">${escapeHtml(error.message)}</div>`;
  }
}

function bindArticleFilters() {
  articleList.querySelector("[data-public-series-filter]")?.addEventListener("change", (event) => {
    articleFilters.series = event.target.value;
    renderArticleList();
  });
  articleList.querySelector("[data-public-tag-filter]")?.addEventListener("change", (event) => {
    articleFilters.tag = event.target.value;
    renderArticleList();
  });
  articleList.querySelector("[data-public-article-search]")?.addEventListener("change", (event) => {
    articleFilters.query = event.target.value;
    renderArticleList();
  });
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
    document.querySelector("#article-meta").textContent = [
      articleMeta(article),
      article.series ? `系列：${article.series}` : "",
      article.pinned ? "置顶文章" : "",
    ].filter(Boolean).join(" · ");
    articleContent.innerHTML = `${article.coverImage ? `<img class="article-detail-cover" src="${escapeHtml(article.coverImage)}" alt="" loading="lazy" />` : ""}${parser(markdown)}`;
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
