(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Year
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Smooth scroll with header offset
  const header = $(".topbar");
  const headerOffset = () => (header ? header.getBoundingClientRect().height : 0);

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const hash = a.getAttribute("href");
    if (!hash || hash.length <= 1) return;

    const el = document.querySelector(hash);
    if (!el) return;

    e.preventDefault();
   // si es el botón de subir, ve directo al top real
if (hash === "#page-top") {
  window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  return;
}

const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset() + 2;
window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });

    closeMobile();
  });

  // Reveal on scroll
  const revealEls = $$(".reveal");
  if (!prefersReduced && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  // Active nav link
  const sections = ["#about", "#work", "#skills", "#contact"]
    .map((id) => document.querySelector(id))
    .filter(Boolean);

  const navLinks = $$(".nav__link");
  const mobileLinks = $$(".mobile__link");

  const setActive = (id) => {
    [...navLinks, ...mobileLinks].forEach((a) => {
      const href = a.getAttribute("href");
      a.classList.toggle("active", href === id);
    });
  };

  if (sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: `-${Math.round(headerOffset())}px 0px -60% 0px`, threshold: [0.14, 0.22, 0.3] }
    );
    sections.forEach((s) => spy.observe(s));
  }

  // Mobile menu
  const burger = $(".burger");
  const mobile = $(".mobile");

  function openMobile() {
    if (!burger || !mobile) return;
    burger.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    mobile.style.display = "block";
    mobile.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeMobile() {
    if (!burger || !mobile) return;
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    mobile.style.display = "none";
    mobile.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (burger && mobile) {
    burger.addEventListener("click", () => {
      burger.classList.contains("is-open") ? closeMobile() : openMobile();
    });

    mobile.addEventListener("click", (e) => {
      if (e.target === mobile) closeMobile();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMobile();
    });
  }

  // Filters
  const filterButtons = $$(".filter");
  const works = $$(".work");

  const applyFilter = (key) => {
    works.forEach((card) => {
      const tags = (card.getAttribute("data-tags") || "").split(/\s+/).filter(Boolean);
      const show = key === "all" || tags.includes(key);
      card.style.display = show ? "" : "none";
    });
  };

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      applyFilter(btn.dataset.filter || "all");
    });
  });

  // Scrollmeter (hidden at top, appears when user scrolls)
  const meter = $(".scrollmeter");
  const fill = $(".scrollmeter__fill");

  const updateScroll = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const p = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

    if (fill) fill.style.height = `${p}%`;
    if (meter) meter.classList.toggle("is-visible", scrollTop > 60);
  };

  window.addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();

  // Typewriter
  function setupTypewriter() {
    const el = document.querySelector(".type[data-type]");
    if (!el) return;

    let phrases;
    try {
      phrases = JSON.parse(el.getAttribute("data-type"));
    } catch {
      phrases = [el.getAttribute("data-type") || ""];
    }

    const speed = Math.max(18, Number(el.getAttribute("data-speed")) || 44);
    const useCursor = el.getAttribute("data-cursor") === "true";

    if (prefersReduced) {
      el.textContent = phrases[0] || "";
      if (!useCursor) el.removeAttribute("data-cursor");
      return;
    }

    let p = 0;
    let i = 0;
    let deleting = false;

    const hold = 900;
    const gap = 220;

    const tick = () => {
      const text = phrases[p] || "";
      el.classList.add("is-typing");

      if (!deleting) {
        i++;
        el.textContent = text.slice(0, i);

        if (i >= text.length) {
          el.classList.remove("is-typing");
          setTimeout(() => {
            // si solo hay una palabra/frase, no borres, déjalo fijo:
            if (phrases.length === 1) return;
            deleting = true;
            tick();
          }, hold);
          return;
        }
        setTimeout(tick, speed);
      } else {
        i--;
        el.textContent = text.slice(0, i);

        if (i <= 0) {
          deleting = false;
          p = (p + 1) % phrases.length;
          el.classList.remove("is-typing");
          setTimeout(tick, gap);
          return;
        }
        setTimeout(tick, Math.max(14, Math.floor(speed * 0.55)));
      }
    };

    // start when hero is visible
    const hero = document.querySelector(".hero");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          tick();
        }
      },
      { threshold: 0.3 }
    );
    if (hero) io.observe(hero);
    else tick();
  }

  setupTypewriter();
  // ---------- Click en proyecto -> scroll a su case ----------
const workLinks = document.querySelectorAll(".work-link");
workLinks.forEach((a) => {
  a.addEventListener("click", () => {
    // el scroll ya lo gestiona el anchor
  });
});

// ---------- Parallax (case pages) ----------
const parallaxEls = Array.from(document.querySelectorAll("[data-parallax]"));

if (!prefersReduced && parallaxEls.length) {
  let ticking = false;

  const updateParallax = () => {
    const y = window.scrollY;

    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.getAttribute("data-parallax")) || 0.2;
      el.style.transform = `translate3d(0, ${y * speed * -0.12}px, 0)`;
    });

    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  }, { passive: true });

  updateParallax();
}
// Viewer carousel (para todos los cases)
document.querySelectorAll("[data-viewer]").forEach((viewer) => {
  const img = viewer.querySelector("[data-viewer-img]");
  const prev = viewer.querySelector(".viewer__btn--prev");
  const next = viewer.querySelector(".viewer__btn--next");
  const items = Array.from(viewer.querySelectorAll(".viewer__data [data-src]"));

  if (!img || !prev || !next || items.length === 0) return;

  let index = 0;

  const show = (i) => {
    index = (i + items.length) % items.length;

    // fade rápido
    img.style.transition = "opacity .18s ease";
    img.style.opacity = "0";

    setTimeout(() => {
      img.src = items[index].dataset.src;
      img.alt = items[index].dataset.alt || "Imagen";
      img.style.opacity = "1";
    }, 120);
  };

  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));

  show(0);
});


})();
