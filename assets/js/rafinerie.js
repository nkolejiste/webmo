/**
 * RAFINERIE
 * Jeden společný JS pro stránky Rafinerie.
 */

/* =========================================================
   LAYOUT – HLAVIČKA A MENU
========================================================= */


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

function getWebRoot() {
  const script = [...document.scripts].find(item => item.src.endsWith("/assets/js/rafinerie.js"));
  return script ? new URL("../../", script.src) : new URL("../", window.location.href);
}

function renderRafinerieHeader() {
  const header = document.getElementById("siteHeader");
  if (!header) return;

  const webRoot = getWebRoot();

  header.innerHTML = `
    <a class="brand" href="${new URL("rafinerie/index.html", webRoot).href}" aria-label="Rafinerie – úvodní stránka">
      <span class="brand-mark"></span>
      <span>RAFINERIE</span>
    </a>

    <button class="menu-toggle" id="menuToggle" aria-label="Otevřít menu" aria-expanded="false" aria-controls="mainNav">
      <span></span><span></span>
    </button>

    <nav class="main-nav" id="mainNav" aria-label="Navigace Rafinerie">
      <a class="active" aria-current="page" href="${new URL("rafinerie/index.html", webRoot).href}">Rafinerie</a>
      <button class="theme-toggle" id="themeToggle" type="button" aria-label="Přepnout na tmavý motiv"></button>
    </nav>`;
}

/* =========================================================
   KLASICKÝ JS / ANIMACE A INTERAKTIVITA
========================================================= */

function initRafinerieInteractions() {
  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  const updateHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 24);
  };

  const closeMenu = () => {
    mainNav?.classList.remove("open");
    menuToggle?.classList.remove("active");
    menuToggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  menuToggle?.addEventListener("click", () => {
    const open = mainNav?.classList.toggle("open") ?? false;
    menuToggle.classList.toggle("active", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  });

  mainNav?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));

  window.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

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
}

document.addEventListener("DOMContentLoaded", () => {
  renderRafinerieHeader();
  initThemeToggle();
  initRafinerieInteractions();
});
