const projectFinder = document.querySelector("#project-finder");
const finderButtons = document.querySelectorAll(".finder-view-button");
const finderWindow = document.querySelector(".finder-window");

function setProjectView(view) {
  if (!projectFinder) {
    return;
  }

  projectFinder.className = `finder-projects finder-${view}-view`;
  finderWindow?.classList.toggle("is-list-view", view === "list");

  finderButtons.forEach((button) => {
    const isActive = button.dataset.view === view;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

const savedProjectView = (() => {
  try {
    return localStorage.getItem("projectView");
  } catch {
    return null;
  }
})();

setProjectView(savedProjectView || "card");

finderButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const view = button.dataset.view || "card";

    try {
      localStorage.setItem("projectView", view);
    } catch {
      // View still changes for the current page when storage is unavailable.
    }

    setProjectView(view);
  });
});
