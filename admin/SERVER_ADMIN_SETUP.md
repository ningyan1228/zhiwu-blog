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