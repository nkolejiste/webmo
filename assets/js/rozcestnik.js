/**
 * ROZCESTNÍK
 * Pouze animace a interaktivita hlavního rozcestníku.
 */


function getCurrentTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function updateThemeInterface() {
  const theme = getCurrentTheme();
  const dark = theme === "dark";

  const themeColor = document.querySelector('meta[name="theme-color"]');
  themeColor?.setAttribute("content", dark ? "#090b0d" : "#f5f5f3");

  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) {
    const filename = dark ? "favicon-dark.svg" : "favicon.svg";
    favicon.href = new URL(filename, favicon.href).href;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateThemeInterface();

  // Animace prvků při scrollování
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
  } else {
    document.querySelectorAll(".reveal").forEach(element => element.classList.add("visible"));
  }
});
