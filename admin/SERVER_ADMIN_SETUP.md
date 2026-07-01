# Server admin login setup

This file is for `~/projects/blog-proxy/server.js` on the Tencent Cloud server. The GitHub Pages frontend now has `/admin/`, but the password check must live on the server. Never put the admin password in this GitHub repository.

## 1. Add admin password to `.env`

```bash
cd ~/projects/blog-proxy
code .env
```

Add this line and replace the value with a strong password:

```env
ADMIN_PASSWORD=replace-with-your-strong-password
```

Do not upload `.env` to GitHub.

## 2. Allow Authorization in CORS

In `setCors(req, res)`, make sure these lines exist:

```js
res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Analytics-Token");
res.setHeader("Access-Control-Allow-Credentials", "true");
```

## 3. Ensure crypto is available

If `crypto` is already required at the top of `server.js`, do not add it twice. Otherwise add:

```js
const crypto = require("crypto");
```

## 4. Add session helpers

Put this near the other helper functions:

```js
const adminSessions = new Map();
const ADMIN_SESSION_TTL = 1000 * 60 * 60 * 6;

function createAdminSession() {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL).toISOString();
  adminSessions.set(token, expiresAt);
  return { token, expiresAt };
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return "";
  return header.slice(7).trim();
}

function verifyAdmin(req) {
  const token = getBearerToken(req);
  if (!token) return null;
  const expiresAt = adminSessions.get(token);
  if (!expiresAt) return null;
  if (Date.now() > new Date(expiresAt).getTime()) {
    adminSessions.delete(token);
    return null;
  }
  return { token, expiresAt };
}

function requireAdmin(req, res) {
  const session = verifyAdmin(req);
  if (session) return session;
  sendJson(req, res, 401, { ok: false, message: "Admin login required" });
  return null;
}
```

## 5. Add admin routes

Put these routes near `/api/project-stars`:

```js
if (req.method === "POST" && url.pathname === "/api/admin/login") {
  const body = await readJson(req);
  const password = String(body.password || "");

  if (!process.env.ADMIN_PASSWORD) {
    sendJson(req, res, 500, { ok: false, message: "ADMIN_PASSWORD is not configured" });
    return;
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    sendJson(req, res, 401, { ok: false, message: "Wrong password" });
    return;
  }

  const session = createAdminSession();
  sendJson(req, res, 200, { ok: true, owner: "zhiwu", token: session.token, expiresAt: session.expiresAt });
  return;
}

if (req.method === "GET" && url.pathname === "/api/admin/me") {
  const session = requireAdmin(req, res);
  if (!session) return;
  sendJson(req, res, 200, { ok: true, owner: "zhiwu", expiresAt: session.expiresAt });
  return;
}

if (req.method === "POST" && url.pathname === "/api/admin/logout") {
  const token = getBearerToken(req);
  if (token) adminSessions.delete(token);
  sendJson(req, res, 200, { ok: true });
  return;
}
```

## 6. Rebuild container

```bash
cd ~/projects/blog-proxy
docker compose up -d --build
```

## 7. Visit admin page

```text
https://gjsx.uno/admin/
```

If the login page says the admin API is missing, the server routes are not deployed yet or the container was not rebuilt.
## 8. Article publisher env variables

The admin console can publish Markdown articles into this GitHub Pages repository. Keep the GitHub token only on the server.

Add these lines to `~/projects/blog-proxy/.env`:

```env
GITHUB_TOKEN=replace-with-your-fine-grained-token
GITHUB_OWNER=ningyan1228
GITHUB_REPO=zhiwu-blog
GITHUB_BRANCH=main
```

Create a GitHub fine-grained token with access only to `ningyan1228/zhiwu-blog`:

```text
Contents: Read and write
Metadata: Read
```

Never upload `.env` to GitHub.

## 9. Add GitHub article helper functions

Put this near the other helper functions in `~/projects/blog-proxy/server.js`, after `requireAdmin` is a good place:

```js
function requireGithubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || "ningyan1228";
  const repo = process.env.GITHUB_REPO || "zhiwu-blog";
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured");
  }

  return { token, owner, repo, branch };
}

function encodeGitHubContent(content) {
  return Buffer.from(content, "utf8").toString("base64");
}

function normalizeArticleSlug(value, title) {
  const source = String(value || title || "").toLowerCase();
  const slug = source
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  if (slug) return slug;

  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0")
  ].join("");

  return `post-${stamp}`;
}

async function githubRequest(method, filePath, body) {
  const { token, owner, repo, branch } = requireGithubConfig();
  const encodedPath = filePath.split("/").map(encodeURIComponent).join("/");
  const branchQuery = method === "GET" ? `?ref=${encodeURIComponent(branch)}` : "";
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}${branchQuery}`, {
    method,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "zhiwu-blog-admin"
    },
    body: body ? JSON.stringify({ ...body, branch }) : undefined
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || `GitHub ${method} ${filePath} failed`);
  }

  return data;
}

async function getGithubFile(filePath) {
  try {
    const data = await githubRequest("GET", filePath);
    const content = data.content ? Buffer.from(data.content, "base64").toString("utf8") : "";
    return { exists: true, sha: data.sha, content };
  } catch (error) {
    if (/not found/i.test(error.message)) {
      return { exists: false, sha: "", content: "" };
    }
    throw error;
  }
}

async function putGithubFile(filePath, content, message, sha = "") {
  const body = {
    message,
    content: encodeGitHubContent(content)
  };

  if (sha) body.sha = sha;
  return githubRequest("PUT", filePath, body);
}

function todayInShanghai() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
```

## 10. Add article routes

Put these routes inside the main `http.createServer` callback, near the other `/api/admin/*` routes and before `/api/private-link/unlock`:

```js
if (req.method === "GET" && url.pathname === "/api/admin/articles") {
  const session = requireAdmin(req, res);
  if (!session) return;

  const indexFile = await getGithubFile("articles.json");
  const items = indexFile.exists && indexFile.content.trim()
    ? JSON.parse(indexFile.content)
    : [];

  sendJson(req, res, 200, {
    ok: true,
    items,
    time: new Date().toISOString()
  });
  return;
}

if (req.method === "POST" && url.pathname === "/api/admin/articles/publish") {
  const session = requireAdmin(req, res);
  if (!session) return;

  const body = await readJson(req);
  const title = cleanText(body.title, 160);
  const excerpt = cleanText(body.excerpt, 320);
  const category = cleanText(body.category, 80);
  const slug = normalizeArticleSlug(cleanText(body.slug, 120), title);
  const markdown = typeof body.markdown === "string" ? body.markdown.trim() : "";
  const readTime = Math.max(1, Math.min(120, Number(body.readTime || 5)));
  const tags = Array.isArray(body.tags)
    ? body.tags.map((tag) => cleanText(String(tag), 40)).filter(Boolean).slice(0, 12)
    : [];

  if (!title || !excerpt || !category || !markdown) {
    sendJson(req, res, 400, { ok: false, message: "Missing title, excerpt, category or markdown" });
    return;
  }

  const indexFile = await getGithubFile("articles.json");
  const items = indexFile.exists && indexFile.content.trim()
    ? JSON.parse(indexFile.content)
    : [];

  if (items.some((item) => item.slug === slug)) {
    sendJson(req, res, 409, { ok: false, message: `Article slug already exists: ${slug}` });
    return;
  }

  const postPath = `posts/${slug}.md`;
  const postFile = await getGithubFile(postPath);
  if (postFile.exists) {
    sendJson(req, res, 409, { ok: false, message: `Markdown file already exists: ${postPath}` });
    return;
  }

  const article = {
    slug,
    title,
    excerpt,
    date: todayInShanghai(),
    category,
    readTime,
    tags
  };

  const nextItems = [article, ...items];
  const nextIndex = `${JSON.stringify(nextItems, null, 2)}\n`;

  await putGithubFile(postPath, `${markdown}\n`, `Add article: ${title}`);
  await putGithubFile("articles.json", nextIndex, `Update article index: ${title}`, indexFile.sha);

  sendJson(req, res, 200, {
    ok: true,
    article,
    articleUrl: `https://gjsx.uno/articles/post.html?slug=${encodeURIComponent(slug)}`
  });
  return;
}
```

Optionally add these to `getRoutes()`:

```js
{ path: "/api/admin/articles", method: "GET", description: "Admin article list" },
{ path: "/api/admin/articles/publish", method: "POST", description: "Publish Markdown article to GitHub" },
```

## 11. Rebuild after article routes

```bash
cd ~/projects/blog-proxy
docker compose up -d --build
```

Then open:

```text
https://gjsx.uno/admin/
```

If the article panel says the article API is missing, the new server routes are not deployed yet, or the container was not rebuilt.