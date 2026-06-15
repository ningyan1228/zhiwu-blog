const toolFinder = document.querySelector("#tool-finder");
const toolButtons = document.querySelectorAll(".finder-view-button");
const toolFilterButtons = document.querySelectorAll(".tool-filter-button");
const toolWindow = document.querySelector(".finder-window");
const validToolFilters = new Set(["all", "daily", "content", "study", "design", "sports", "info"]);

function setToolView(view) {
  if (!toolFinder) {
    return;
  }

  toolFinder.className = `finder-projects finder-${view}-view`;
  toolWindow?.classList.toggle("is-list-view", view === "list");

  toolButtons.forEach((button) => {
    const isActive = button.dataset.view === view;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

const savedToolView = (() => {
  try {
    return localStorage.getItem("toolView");
  } catch {
    return null;
  }
})();

setToolView(savedToolView || "card");

toolButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const view = button.dataset.view || "card";

    try {
      localStorage.setItem("toolView", view);
    } catch {
      // View still changes for the current page when storage is unavailable.
    }

    setToolView(view);
  });
});

function setToolFilter(filter) {
  const activeFilter = validToolFilters.has(filter) ? filter : "all";

  document.querySelectorAll("#tool-finder .finder-project-card").forEach((card) => {
    const categories = (card.dataset.category || "").split(/\s+/);
    const shouldShow = activeFilter === "all" || categories.includes(activeFilter);
    card.classList.toggle("is-hidden", !shouldShow);
  });

  toolFilterButtons.forEach((button) => {
    const isActive = button.dataset.filter === activeFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

const savedToolFilter = (() => {
  try {
    return localStorage.getItem("toolFilter");
  } catch {
    return null;
  }
})();

setToolFilter(savedToolFilter || "all");

toolFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter || "all";

    try {
      localStorage.setItem("toolFilter", filter);
    } catch {
      // Filter still changes for the current page when storage is unavailable.
    }

    setToolFilter(filter);
  });
});
