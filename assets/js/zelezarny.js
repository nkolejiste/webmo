/**
 * ŽELEZÁRNY
 * Jeden společný JS pro všechny stránky Železáren.
 */

/* =========================================================
   LAYOUT – HLAVIČKA A MENU
========================================================= */

function renderZelezarnyHeader() {
  const header = document.getElementById("siteHeader");
  if (!header) return;

  const activePage = document.body.dataset.page;
  const navItems = [
    { href: "index.html", label: "Úvod", page: "zelezarny-home" },
    { href: "projekt.html", label: "Projekt", page: "zelezarny-projekt" },
    { href: "stavba.html", label: "Stavba", page: "zelezarny-stavba" },
  ];

  const links = navItems.map(item => {
    const active = item.page === activePage ? ' class="active" aria-current="page"' : "";
    return `<a${active} href="${item.href}">${item.label}</a>`;
  }).join("\n      ");

  header.innerHTML = `
    <a class="brand" href="index.html" aria-label="Železárny – úvodní stránka">
      <span class="brand-mark"></span>
      <span>ŽELEZÁRNY</span>
    </a>

    <button class="menu-toggle" id="menuToggle" aria-label="Otevřít menu" aria-expanded="false" aria-controls="mainNav">
      <span></span><span></span>
    </button>

    <nav class="main-nav" id="mainNav" aria-label="Navigace Železáren">
      ${links}
    </nav>`;
}

/* =========================================================
   KLASICKÝ JS / ANIMACE A INTERAKTIVITA
========================================================= */

function initZelezarnyInteractions() {
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

  const statsSection = document.querySelector(".stats-section");
  const statCircles = statsSection ? [...statsSection.querySelectorAll(".stat-circle")] : [];

  if (statsSection && statCircles.length) {
    statsSection.classList.add("stats-animate");

    const revealStats = () => {
      statCircles.forEach((circle, index) => {
        window.setTimeout(() => circle.classList.add("is-visible"), index * 360);
      });
    };

    if (!("IntersectionObserver" in window)) {
      window.setTimeout(revealStats, 250);
    } else {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const statsObserver = new IntersectionObserver(
            entries => {
              entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                revealStats();
                statsObserver.unobserve(statsSection);
              });
            },
            { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
          );

          statsObserver.observe(statsSection);
        });
      });
    }
  }

  // Lightbox fotografií – aktivuje se jen na stránkách, kde je jeho HTML.
  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxImg = document.getElementById("lightboxImg");
  const closeBtn = document.querySelector(".lightbox-close");

  if (lightboxModal && lightboxImg) {
    document.querySelectorAll(".chapter-media img").forEach(img => {
      img.addEventListener("click", () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || "Detailní fotka";
        lightboxModal.classList.add("active");
      });
    });

    const closeLightbox = () => lightboxModal.classList.remove("active");
    closeBtn?.addEventListener("click", closeLightbox);
    lightboxModal.addEventListener("click", event => {
      if (event.target === lightboxModal) closeLightbox();
    });
    window.addEventListener("keydown", event => {
      if (event.key === "Escape") closeLightbox();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderZelezarnyHeader();
  initZelezarnyInteractions();
});
