/**
 * ŽELEZÁRNY
 * Jeden společný JS pro všechny stránky Železáren.
 */

/* =========================================================
   LAYOUT – HLAVIČKA A MENU
========================================================= */

function getWebRoot() {
  const script = [...document.scripts].find(item => item.src.endsWith("/assets/js/zelezarny.js"));
  return script ? new URL("../../", script.src) : new URL("../", window.location.href);
}

function renderZelezarnyHeader() {
  const header = document.getElementById("siteHeader");
  if (!header) return;

  const activePage = document.body.dataset.page;
  const webRoot = getWebRoot();
  const navItems = [
    { href: new URL("zelezarny/index.html", webRoot).href, label: "Úvod", page: "zelezarny-home" },
    { href: new URL("zelezarny/projekt.html", webRoot).href, label: "Projekt", page: "zelezarny-projekt" },
    { href: new URL("zelezarny/stavba.html", webRoot).href, label: "Stavba", page: "zelezarny-stavba" },
  ];

  const links = navItems.map(item => {
    const active = item.page === activePage ? ' class="active" aria-current="page"' : "";
    return `<a${active} href="${item.href}">${item.label}</a>`;
  }).join("\n      ");

  header.innerHTML = `
    <a class="brand" href="${new URL("zelezarny/index.html", webRoot).href}" aria-label="Železárny – úvodní stránka">
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
  let detailOpener = null;

  document.querySelectorAll(".chapter-detail-link").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const target = link.getAttribute("href");
      if (!target) return;
      const detailDialog = document.querySelector(target);
      if (!(detailDialog instanceof HTMLDialogElement)) return;
      detailOpener = link;
      if (!detailDialog.open) detailDialog.showModal();
      document.body.classList.add("detail-open");
      detailDialog.querySelector(".chapter-detail-shell")?.scrollTo({ top: 0 });
      detailDialog.querySelector(".chapter-detail-close")?.focus();
    });
  });

  document.querySelectorAll(".chapter-detail-dialog").forEach(detailDialog => {
    const detailClose = detailDialog.querySelector(".chapter-detail-close");

    const closeDetailDialog = () => {
      if (!detailDialog.open) return;
      detailDialog.close();
    };

    detailClose?.addEventListener("click", closeDetailDialog);

    detailDialog.addEventListener("click", event => {
      if (event.target !== detailDialog) return;
      const rect = detailDialog.getBoundingClientRect();
      const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside) closeDetailDialog();
    });

    detailDialog.addEventListener("close", () => {
      document.body.classList.remove("detail-open");
      detailOpener?.focus();
    });
  });

  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxImg = document.getElementById("lightboxImg");
  const closeBtn = document.querySelector(".lightbox-close");

  if (lightboxModal instanceof HTMLDialogElement && lightboxImg) {
    document.querySelectorAll(".chapter-media img, .chapter-detail-gallery img").forEach(img => {
      img.addEventListener("click", () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || "Detailní fotka";
        if (!lightboxModal.open) lightboxModal.showModal();
      });
    });

    const closeLightbox = () => {
      if (lightboxModal.open) lightboxModal.close();
    };

    closeBtn?.addEventListener("click", closeLightbox);
    lightboxModal.addEventListener("click", event => {
      if (event.target === lightboxModal) closeLightbox();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderZelezarnyHeader();
  initZelezarnyInteractions();
});
