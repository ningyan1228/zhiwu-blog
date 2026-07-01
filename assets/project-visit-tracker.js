(() => {
  const endpoint = "https://api.gjsx.uno/api/analytics/track";
  const script = document.currentScript;
  const projectId =
    window.ZHIWU_PROJECT_ID ||
    script?.dataset?.projectId ||
    document.documentElement?.dataset?.projectId ||
    "";

  if (!projectId) return;

  const visitorKey = "zhiwu_project_visitor_id";
  const getVisitorId = () => {
    try {
      let id = localStorage.getItem(visitorKey);
      if (!id) {
        id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        localStorage.setItem(visitorKey, id);
      }
      return id;
    } catch {
      return `${Date.now()}-${Math.random()}`;
    }
  };

  const send = (type = "pageview") => {
    const body = JSON.stringify({
      site: "project-star",
      type,
      projectId,
      path: location.pathname || "/",
      title: document.title || projectId,
      label: projectId,
      href: location.href,
      referrer: document.referrer || "",
      visitorId: getVisitorId(),
      screen: `${window.screen.width}x${window.screen.height}`,
      time: new Date().toISOString(),
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
      return;
    }

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  };

  let lastTrackedPath = "";
  const trackPage = () => {
    const path = `${location.pathname}${location.search}${location.hash}`;
    if (path === lastTrackedPath) return;
    lastTrackedPath = path;
    send("pageview");
  };

  trackPage();
  window.addEventListener("popstate", trackPage);
  window.addEventListener("hashchange", trackPage);

  for (const method of ["pushState", "replaceState"]) {
    const original = history[method];
    history[method] = function patchedHistoryMethod(...args) {
      const result = original.apply(this, args);
      window.setTimeout(trackPage, 0);
      return result;
    };
  }
})();