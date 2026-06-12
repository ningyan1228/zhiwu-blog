const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
]);

function getAllowedOrigin(req: Request) {
  const origin = req.headers.get("origin") || "*";
  const configured = Deno.env.get("ALLOWED_ORIGIN") ||
    Deno.env.get("ALLOWED_ORIGINS");

  if (!configured) {
    return origin;
  }

  if (configured === "*") {
    return "*";
  }

  const allowed = configured.split(",").map((item) => item.trim()).filter(Boolean);
  return allowed.includes(origin) ? origin : allowed[0] || origin;
}

function corsHeaders(req: Request) {
  return {
    "Access-Control-Allow-Origin": getAllowedOrigin(req),
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function buildTargetUrl(req: Request) {
  const targetBase = Deno.env.get("PROXY_TARGET_URL");
  if (!targetBase) {
    return null;
  }

  const incoming = new URL(req.url);
  const proxyPath = incoming.pathname.replace(/^\/api\/proxy\/?/, "");
  const target = new URL(proxyPath, targetBase.endsWith("/") ? targetBase : `${targetBase}/`);
  target.search = incoming.search;

  return target;
}

function proxyHeaders(req: Request) {
  const headers = new Headers(req.headers);

  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }

  const upstreamAuthorization = Deno.env.get("PROXY_AUTHORIZATION");
  if (upstreamAuthorization) {
    headers.set("Authorization", upstreamAuthorization);
  }

  return headers;
}

async function handler(req: Request) {
  const cors = corsHeaders(req);
  const url = new URL(req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (url.pathname === "/" || url.pathname === "/api/health") {
    return Response.json(
      {
        ok: true,
        service: "zhiwu-deno-proxy",
        usage: "/api/proxy/*",
      },
      { headers: cors },
    );
  }

  if (!url.pathname.startsWith("/api/proxy")) {
    return Response.json(
      { error: "Not found", usage: "/api/proxy/*" },
      { status: 404, headers: cors },
    );
  }

  const target = buildTargetUrl(req);
  if (!target) {
    return Response.json(
      {
        error: "PROXY_TARGET_URL is not configured.",
        example: "/api/proxy/notion/pages",
      },
      { status: 500, headers: cors },
    );
  }

  const init: RequestInit = {
    method: req.method,
    headers: proxyHeaders(req),
    body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
    redirect: "manual",
  };

  const response = await fetch(target, init);
  const responseHeaders = new Headers(response.headers);

  for (const header of HOP_BY_HOP_HEADERS) {
    responseHeaders.delete(header);
  }

  Object.entries(cors).forEach(([key, value]) => {
    responseHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

Deno.serve(handler);
