/**
 * RAFINERIE
 * Jeden společný JS pro stránky Rafinerie.
 */

/* =========================================================
   LAYOUT – HLAVIČKA A MENU
========================================================= */

function renderRafinerieHeader() {
  const header = document.getElementById("siteHeader");
  if (!header) return;

  header.innerHTML = `
    <a class="brand" href="index.html" aria-label="Rafinerie – úvodní stránka">
      <span class="brand-mark"></span>
      <span>RAFINERIE</span>
    </a>

    <button class="menu-toggle" id="menuToggle" aria-label="Otevřít menu" aria-expanded="false" aria-controls="mainNav">
      <span></span><span></span>
    </button>

    <nav class="main-nav" id="mainNav" aria-label="Navigace Rafinerie">
      <a class="active" aria-current="page" href="index.html">Rafinerie</a>
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
  initRafinerieInteractions();
});
