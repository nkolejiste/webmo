/**
 * ROZCESTNÍK
 * Pouze animace a interaktivita hlavního rozcestníku.
 */


function getCurrentTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function updateThemeInterface() {
  const theme = getCurrentTheme();
  const button = document.getElementById("themeToggle");
  const dark = theme === "dark";

  if (button) {
    const label = dark ? "Přepnout na světlý motiv" : "Přepnout na tmavý motiv";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.setAttribute("aria-pressed", String(dark));
  }

  const themeColor = document.querySelector('meta[name="theme-color"]');
  themeColor?.setAttribute("content", dark ? "#090b0d" : "#f5f5f3");

  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) {
    const filename = dark ? "favicon-dark.svg" : "favicon.svg";
    favicon.href = new URL(filename, favicon.href).href;
  }
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("n-kolejiste-theme", theme);
  } catch {}
  updateThemeInterface();
}

function initThemeToggle() {
  updateThemeInterface();
  document.getElementById("themeToggle")?.addEventListener("click", () => {
    setTheme(getCurrentTheme() === "dark" ? "light" : "dark");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.createElement("button");
  themeToggle.className = "theme-toggle theme-toggle-floating";
  themeToggle.id = "themeToggle";
  themeToggle.type = "button";
  themeToggle.setAttribute("aria-label", "Přepnout na tmavý motiv");
  document.body.appendChild(themeToggle);
  initThemeToggle();

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
