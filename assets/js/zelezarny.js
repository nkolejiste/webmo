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


function initProjectProcess() {
  const viewport = document.getElementById("processViewport");
  const wagon = document.getElementById("flowWagonSvg");
  if (!viewport || !wagon) return;

  const stepEl = document.getElementById("processStep");
  const wagonTypeEl = document.getElementById("processWagonType");
  const titleEl = document.getElementById("processTitle");
  const textEl = document.getElementById("processText");
  const wagonName = document.getElementById("wagonName");
  const scaleValue = document.getElementById("scaleValue");
  const facilities = new Map([...document.querySelectorAll("[data-facility]")].map(el => [el.dataset.facility, el]));
  const legends = new Map([...document.querySelectorAll("[data-legend]")].map(el => [el.dataset.legend, el]));
  const scrapCrane = document.getElementById("scrapCrane");
  const scrapDrop = document.getElementById("scrapDrop");
  const portalCrane = document.getElementById("portalCrane");
  const motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const positions = { yard: 72, scrap: 338, furnace: 624, rolling: 900, scale: 1110, transshipment: 1370 };
  let x = positions.yard;
  let started = false;

  const wait = ms => new Promise(resolve => setTimeout(resolve, motionReduced ? Math.min(ms, 80) : ms));
  const ease = t => 1 - Math.pow(1 - t, 4);

  const setStatus = (step, type, title, text) => {
    if (stepEl) stepEl.textContent = step;
    if (wagonTypeEl) wagonTypeEl.textContent = type;
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
  };

  const activate = key => {
    facilities.forEach(el => el.classList.remove("active", "processing"));
    legends.forEach(el => el.classList.remove("active"));
    if (key === "return") {
      facilities.get("yard")?.classList.add("active");
      legends.get("return")?.classList.add("active");
      return;
    }
    facilities.get(key)?.classList.add("active");
    legends.get(key)?.classList.add("active");
  };

  const setWagon = (type, load) => {
    wagon.classList.toggle("is-eanos", type === "eanos");
    wagon.classList.toggle("is-res", type === "res");
    wagon.classList.toggle("load-scrap", load === "scrap");
    wagon.classList.toggle("load-billets", load === "billets");
    wagon.classList.toggle("is-empty", load === "empty");
    if (wagonName) wagonName.textContent = type === "res" ? "Res" : "Eanos";
  };

  const moveTo = (target, duration) => new Promise(resolve => {
    if (motionReduced) {
      x = target;
      wagon.setAttribute("transform", `translate(${x} 396)`);
      resolve();
      return;
    }
    const from = x;
    const distance = target - from;
    const start = performance.now();
    const frame = now => {
      const p = Math.min(1, (now - start) / duration);
      x = from + distance * ease(p);
      wagon.setAttribute("transform", `translate(${x.toFixed(2)} 396)`);
      if (p < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });

  const processFacility = async (key, duration) => {
    facilities.get(key)?.classList.add("processing");
    await wait(duration);
    facilities.get(key)?.classList.remove("processing");
  };

  const run = async () => {
    if (started) return;
    started = true;
    while (true) {
      x = positions.yard;
      wagon.setAttribute("transform", `translate(${x} 396)`);
      setWagon("eanos", "empty");
      activate("yard");
      setStatus("1 / 7", "EANOS · PRÁZDNÝ", "Prázdný Eanos odjíždí ze seřadiště.", "Vůz je připravený pro obsluhu šrotového pole.");
      await wait(900);

      activate("scrap");
      setStatus("2 / 7", "EANOS · NAKLÁDKA", "Eanos přijíždí na šrotové pole.", "Jeřáb spustí drapák a postupně naplní vůz hutním šrotem.");
      await moveTo(positions.scrap, 1900);
      scrapCrane?.classList.add("active");
      scrapDrop?.classList.add("active");
      await processFacility("scrap", 1900);
      setWagon("eanos", "scrap");
      scrapCrane?.classList.remove("active");
      scrapDrop?.classList.remove("active");
      await wait(350);

      activate("furnace");
      setStatus("3 / 7", "EANOS · ŠROT", "Ložený vůz míří k elektrické peci.", "U pece se šrot vyloží a vůz se uvolní pro další část provozního cyklu.");
      await moveTo(positions.furnace, 2050);
      await processFacility("furnace", 1700);
      setWagon("eanos", "empty");
      wagon.classList.add("transforming");
      await wait(280);
      setWagon("res", "empty");
      await wait(320);
      wagon.classList.remove("transforming");

      activate("rolling");
      setStatus("4 / 7", "RES · NAKLÁDKA", "Prázdný Res přejíždí k válcovně.", "Vedle elektrické pece se na plošinový vůz naloží železné sochory.");
      await moveTo(positions.rolling, 1700);
      await processFacility("rolling", 1500);
      setWagon("res", "billets");
      await wait(400);

      activate("scale");
      setStatus("5 / 7", "RES · SOCHORY", "Ložený Res projíždí přes dynamickou váhu.", "Vůz se za jízdy zváží a pokračuje bez dalšího odstavení směrem k expedici.");
      if (scaleValue) scaleValue.textContent = "--.- t";
      await moveTo(positions.scale, 1250);
      facilities.get("scale")?.classList.add("processing");
      await wait(450);
      if (scaleValue) scaleValue.textContent = "72.4 t";
      await wait(850);
      facilities.get("scale")?.classList.remove("processing");

      activate("transshipment");
      setStatus("6 / 7", "RES · VYKLÁDKA", "Res přijíždí na překladiště.", "Portálový jeřáb zvedne sochory z vozu a uloží je do expedičního prostoru.");
      await moveTo(positions.transshipment, 1650);
      portalCrane?.classList.add("active");
      await processFacility("transshipment", 1900);
      setWagon("res", "empty");
      portalCrane?.classList.remove("active");
      await wait(380);

      activate("return");
      setStatus("7 / 7", "RES · PRÁZDNÝ", "Prázdný vůz se vrací na seřadiště.", "Po vykládce se Res vrací zpět na výchozí koleje a provozní cyklus může začít znovu.");
      await moveTo(positions.yard, 2800);
      await wait(1700);
    }
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      run();
      observer.disconnect();
    });
  }, { threshold: .28 });

  observer.observe(viewport);
}


document.addEventListener("DOMContentLoaded", () => {
  renderZelezarnyHeader();
  initZelezarnyInteractions();
  initProjectProcess();
});
