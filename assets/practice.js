const practiceBoard = document.querySelector("#practice-board");
const practiceButtons = document.querySelectorAll(".practice-finder .finder-view-button");

function setPracticeView(view) {
  if (!practiceBoard) {
    return;
  }

  practiceBoard.className = `practice-board practice-${view}-view`;

  practiceButtons.forEach((button) => {
    const isActive = button.dataset.view === view;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

const savedPracticeView = (() => {
  try {
    return localStorage.getItem("practiceView");
  } catch {
    return null;
  }
})();

setPracticeView(savedPracticeView || "list");

practiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const view = button.dataset.view || "list";

    try {
      localStorage.setItem("practiceView", view);
    } catch {
      // View still changes for the current page when storage is unavailable.
    }

    setPracticeView(view);
  });
});
