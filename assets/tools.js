const toolFinder = document.querySelector("#tool-finder");
const toolButtons = document.querySelectorAll(".finder-view-button");
const toolWindow = document.querySelector(".finder-window");

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
