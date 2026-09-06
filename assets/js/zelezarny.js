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


function initProjectFlow() {
  const scene = document.getElementById("flowScene");
  const wagon = document.getElementById("flowWagon");
  if (!scene || !wagon) return;

  const statusCounter = document.getElementById("flowStatusCounter");
  const statusMode = document.getElementById("flowStatusMode");
  const statusTitle = document.getElementById("flowStatusTitle");
  const statusText = document.getElementById("flowStatusText");
  const nodeMap = new Map([...scene.querySelectorAll(".flow-node")].map(node => [node.dataset.stop, node]));
  const craneMap = new Map([...scene.querySelectorAll(".flow-crane")].map(crane => [crane.dataset.crane, crane]));
  const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

  let currentX = 0;
  let currentY = 0;
  let isAnimating = false;

  const updateTargets = () => {
    const yardNode = nodeMap.get("yard");
    if (!yardNode) return;
    const sceneRect = scene.getBoundingClientRect();
    const yardRect = yardNode.getBoundingClientRect();
    currentX = yardRect.left - sceneRect.left + yardRect.width / 2 - wagon.offsetWidth / 2;
    currentY = parseFloat(getComputedStyle(wagon).top) || 308;
    wagon.style.transform = `translate3d(${currentX}px, 0, 0)`;
  };

  const clearActive = () => {
    nodeMap.forEach(node => node.classList.remove("active", "is-processing"));
    craneMap.forEach(crane => crane.classList.remove("is-active"));
  };

  const setStatus = (counter, mode, title, text) => {
    if (statusCounter) statusCounter.textContent = counter;
    if (statusMode) statusMode.textContent = mode;
    if (statusTitle) statusTitle.textContent = title;
    if (statusText) statusText.textContent = text;
  };

  const setWagonState = ({ type, load }) => {
    wagon.classList.remove("eanos", "res", "empty", "scrap", "billets", "is-loading", "is-unloading", "is-transforming");
    wagon.classList.add(type);
    wagon.classList.add(load);
    const label = wagon.querySelector(".wagon-label");
    if (label) label.textContent = type === "res" ? "Res" : "Eanos";
  };

  const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));

  const moveTo = async (stopId, duration = 1800) => {
    const node = nodeMap.get(stopId);
    if (!node) return;
    clearActive();
    node.classList.add("active");
    const sceneRect = scene.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const targetX = nodeRect.left - sceneRect.left + nodeRect.width / 2 - wagon.offsetWidth / 2;
    const seconds = motionMedia.matches ? 0.01 : duration / 1000;
    wagon.style.transition = `transform ${seconds}s cubic-bezier(.2,.8,.25,1), top .65s ease, width .65s ease, height .65s ease`;
    wagon.style.transform = `translate3d(${targetX}px, 0, 0)`;
    currentX = targetX;
    await wait(motionMedia.matches ? 20 : duration + 60);
  };

  const processAt = async ({ stopId, craneId, processing = 1200, actionClass = "is-loading" }) => {
    const node = nodeMap.get(stopId);
    const crane = craneId ? craneMap.get(craneId) : null;
    if (node) node.classList.add("is-processing");
    if (crane) crane.classList.add("is-active");
    wagon.classList.add(actionClass);
    await wait(motionMedia.matches ? 40 : processing);
    wagon.classList.remove(actionClass);
    if (node) node.classList.remove("is-processing");
    if (crane) crane.classList.remove("is-active");
  };

  const transformWagon = async () => {
    wagon.classList.add("is-transforming");
    wagon.style.transform = `translate3d(${currentX}px, 0, 0) scale(.96)`;
    await wait(motionMedia.matches ? 30 : 260);
    setWagonState({ type: "res", load: "empty" });
    const sceneRect = scene.getBoundingClientRect();
    const furnaceNode = nodeMap.get("furnace");
    if (furnaceNode) {
      const nodeRect = furnaceNode.getBoundingClientRect();
      currentX = nodeRect.left - sceneRect.left + nodeRect.width / 2 - wagon.offsetWidth / 2;
    }
    wagon.style.transform = `translate3d(${currentX}px, 0, 0) scale(1)`;
    await wait(motionMedia.matches ? 30 : 340);
    wagon.classList.remove("is-transforming");
  };

  const run = async () => {
    if (isAnimating) return;
    isAnimating = true;
    updateTargets();
    while (true) {
      setWagonState({ type: "eanos", load: "empty" });
      clearActive();
      nodeMap.get("yard")?.classList.add("active");
      setStatus("1 / 7", "EANOS / PRÁZDNÝ", "Prázdný vůz Eanos odjíždí ze seřadiště.", "Vůz je připravený na seřadišti a míří na šrotové pole, kde bude naložen hutním šrotem.");
      updateTargets();
      await wait(motionMedia.matches ? 120 : 900);

      setStatus("2 / 7", "EANOS / NAKLÁDKA", "Eanos přijíždí na šrotové pole.", "Jeřáb na šrotovém poli naloží vůz hutním šrotem a připraví jej pro odvoz k elektrické peci.");
      await moveTo("scrap", 1750);
      await processAt({ stopId: "scrap", craneId: "scrap", processing: 1700, actionClass: "is-loading" });
      setWagonState({ type: "eanos", load: "scrap" });
      await wait(motionMedia.matches ? 50 : 350);

      setStatus("3 / 7", "EANOS / ŠROT", "Ložený Eanos míří k elektrické peci.", "Po naložení šrotu pokračuje vůz přímo k elektrické peci, kde bude obsah vyložen.");
      await moveTo("furnace", 1900);
      await processAt({ stopId: "furnace", processing: 1350, actionClass: "is-unloading" });
      setWagonState({ type: "eanos", load: "empty" });
      await transformWagon();

      setStatus("4 / 7", "RES / NAKLÁDKA", "U válcovny se z vozu stává Res.", "Po vyložení šrotu pokračuje již jako prázdný Res do válcovny, kde budou naloženy železné sochory.");
      await moveTo("rolling", 1450);
      await processAt({ stopId: "rolling", processing: 1500, actionClass: "is-loading" });
      setWagonState({ type: "res", load: "billets" });
      await wait(motionMedia.matches ? 50 : 300);

      setStatus("5 / 7", "RES / SOCHORY", "Ložený Res projíždí přes dynamickou kolejovou váhu.", "Na průjezdné koleji je vůz zvážen a bez zastavení pokračuje směrem k překladišti.");
      await moveTo("scale", 1100);
      await processAt({ stopId: "scale", processing: 900, actionClass: "is-loading" });

      setStatus("6 / 7", "RES / VYKLÁDKA", "Res přijíždí na překladiště.", "Portálový jeřáb vyloží sochory a připraví vůz na návrat do seřadiště.");
      await moveTo("transshipment", 1500);
      await processAt({ stopId: "transshipment", craneId: "portal", processing: 1700, actionClass: "is-unloading" });
      setWagonState({ type: "res", load: "empty" });
      await wait(motionMedia.matches ? 50 : 260);

      setStatus("7 / 7", "RES / PRÁZDNÝ", "Prázdný vůz se vrací zpět na seřadiště.", "Po vykládce odjíždí prázdný vůz zpět na seřaďovací koleje, kde čeká na další provozní oběh.");
      await moveTo("yard", 2350);
      await wait(motionMedia.matches ? 140 : 1250);
    }
  };

  updateTargets();
  run();
  window.addEventListener("resize", () => window.requestAnimationFrame(updateTargets));
}

document.addEventListener("DOMContentLoaded", () => {
  renderZelezarnyHeader();
  initZelezarnyInteractions();
  initProjectFlow();
});
