/* ============================================================
   APP.JS — Render, filtre, dil değişimi, mobil CTA, scroll reveal
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Dil yönetimi ---------- */
  const LANG_KEY = "site_lang";
  function detectLang() {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "tr" || saved === "en") return saved;
    return navigator.language && navigator.language.toLowerCase().startsWith("tr") ? "tr" : "en";
  }
  let currentLang = detectLang();

  function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || I18N.tr[key] || key;
  }
  function plural(count, key) {
    const label = t(key);
    if (currentLang === "en" && count !== 1) return label + "s";
    return label;
  }
  function pick(field) {
    if (field == null) return "";
    return field[currentLang] || field.tr || field.en || "";
  }
  function fmtPrice(num, currency) {
    const locale = currentLang === "tr" ? "tr-TR" : "en-US";
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency: currency || "TRY", maximumFractionDigits: 0 }).format(num);
    } catch (e) {
      return num + " " + (currency || "");
    }
  }

  function applyLang() {
    document.documentElement.lang = currentLang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.dataset.lang === currentLang ? "true" : "false");
    });
    if (typeof window.onLangChange === "function") window.onLangChange();
  }

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    applyLang();
  }

  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-lang]");
    if (btn) setLang(btn.dataset.lang);
  });

  /* ---------- WhatsApp / telefon linkleri ---------- */
  function waLink(message) {
    return "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(message);
  }
  function telLink() {
    return "tel:" + SITE.phone;
  }

  /* ---------- SVG ikonlar (inline, emoji YOK) ---------- */
  const ICONS = {
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.92 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.24 0 4.35.87 5.93 2.45a8.23 8.23 0 0 1 2.42 5.85c0 4.56-3.71 8.27-8.35 8.27a8.3 8.3 0 0 1-4.22-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.27-4.4c0-4.56 3.72-8.31 8.28-8.31M8.53 6.98c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.03s.87 2.36.99 2.52c.12.16 1.7 2.68 4.19 3.65 2.07.82 2.49.65 2.94.61.45-.04 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28-.24-.12-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.12-.16.24-.63.8-.77.96-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.44-1.34-1.68-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.36-.77-1.86-.19-.47-.4-.42-.55-.43z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2"/></svg>',
    bath: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-2.7 1V11"/><path d="M4 11h18v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M6 18v2"/><path d="M16 18v2"/></svg>',
    area: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
    trending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>'
  };

  /* ---------- İlan kartı render ---------- */
  function propertyStatusLabel(status) {
    return t("status_" + status);
  }

  function renderPropertyCard(p) {
    const img = p.images && p.images[0] ? p.images[0] : "";
    const msg = t("wa_property_msg").replace("{title}", pick(p.title));
    return (
      '<article class="property-card reveal">' +
        '<a href="ilan.html?id=' + encodeURIComponent(p.id) + '" class="property-media" aria-label="' + pick(p.title) + '">' +
          '<span class="property-badge">' + propertyStatusLabel(p.status) + '</span>' +
          '<img src="' + img + '" alt="' + pick(p.title) + '" loading="lazy" width="480" height="360">' +
        '</a>' +
        '<div class="property-body">' +
          '<h3 class="property-title">' + pick(p.title) + '</h3>' +
          '<div class="property-loc">' + ICONS.pin + '<span>' + pick(p.location) + '</span></div>' +
          '<div class="property-price">' + fmtPrice(p.price, p.currency) + '</div>' +
          '<div class="property-meta">' +
            '<span>' + ICONS.bed + p.beds + ' ' + plural(p.beds, "beds") + '</span>' +
            '<span>' + ICONS.bath + p.baths + ' ' + plural(p.baths, "baths") + '</span>' +
            '<span>' + ICONS.area + p.area + ' ' + t("area") + '</span>' +
          '</div>' +
          '<div class="property-actions">' +
            '<a class="btn btn-wa btn-sm" href="' + waLink(msg) + '" target="_blank" rel="noopener">' + ICONS.whatsapp + t("btn_whatsapp") + '</a>' +
            '<a class="btn btn-outline btn-sm" href="ilan.html?id=' + encodeURIComponent(p.id) + '">' + t("btn_detail") + '</a>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  /* ---------- Filtreleme ---------- */
  const BUDGET_BANDS = [
    { key: "0-2000000", min: 0, max: 2000000 },
    { key: "2000000-5000000", min: 2000000, max: 5000000 },
    { key: "5000000-10000000", min: 5000000, max: 10000000 },
    { key: "10000000-999999999", min: 10000000, max: Infinity }
  ];

  function populateFilters() {
    const regionSel = document.getElementById("filter-region");
    const typeSel = document.getElementById("filter-type");
    if (!regionSel || !typeSel) return;

    const regions = Array.from(new Set(PROPERTIES.map(function (p) { return pick(p.location); })));
    regionSel.innerHTML = '<option value="">' + t("filter_all") + '</option>' +
      regions.map(function (r) { return '<option value="' + r + '">' + r + '</option>'; }).join("");

    const types = Array.from(new Set(PROPERTIES.map(function (p) { return p.type; })));
    typeSel.innerHTML = '<option value="">' + t("filter_all") + '</option>' +
      types.map(function (ty) { return '<option value="' + ty + '">' + t("type_" + ty) + '</option>'; }).join("");
  }

  function filterProperties() {
    const region = document.getElementById("filter-region").value;
    const type = document.getElementById("filter-type").value;
    const budget = document.getElementById("filter-budget").value;
    const band = BUDGET_BANDS.find(function (b) { return b.key === budget; });

    return PROPERTIES.filter(function (p) {
      if (region && pick(p.location) !== region) return false;
      if (type && p.type !== type) return false;
      if (band && (p.price < band.min || p.price > band.max)) return false;
      return true;
    });
  }

  function renderGrid() {
    const grid = document.getElementById("property-grid");
    if (!grid) return;
    const list = filterProperties();
    if (list.length === 0) {
      grid.innerHTML = '<div class="empty-state">' + t("empty_results") + '</div>';
      return;
    }
    grid.innerHTML = list.map(renderPropertyCard).join("");
    observeReveals();
  }

  /* ---------- Statik bölümler (about, services, testimonials, stats) ---------- */
  function renderStats() {
    const el = document.getElementById("stats-grid");
    if (!el) return;
    el.innerHTML = SITE.stats.map(function (s) {
      const m = String(s.num).match(/\d+/);
      const target = m ? m[0] : null;
      const prefix = target ? s.num.slice(0, s.num.indexOf(target)) : "";
      const suffix = target ? s.num.slice(s.num.indexOf(target) + target.length) : "";
      const numAttr = target ? ' data-count-to="' + target + '" data-prefix="' + prefix + '" data-suffix="' + suffix + '"' : "";
      return '<div class="reveal"><div class="stat-num"' + numAttr + '>' + (target ? prefix + "0" + suffix : s.num) + '</div><div class="stat-label">' + pick(s.label) + '</div></div>';
    }).join("");
    animateCounters();
  }

  function animateCounters() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nums = document.querySelectorAll(".stat-num[data-count-to]");
    if (nums.length === 0) return;
    if (reduceMotion) {
      nums.forEach(function (el) {
        el.textContent = el.dataset.prefix + el.dataset.countTo + el.dataset.suffix;
      });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.countTo, 10);
        const prefix = el.dataset.prefix || "";
        const suffix = el.dataset.suffix || "";
        const duration = 1400;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = prefix + Math.round(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { io.observe(el); });
  }

  function renderServices() {
    const el = document.getElementById("services-grid");
    if (!el) return;
    el.innerHTML = SITE.services.map(function (s) {
      return '<div class="service-card reveal">' +
        '<div class="service-icon">' + (ICONS[s.icon] || ICONS.home) + '</div>' +
        '<h3>' + pick(s.title) + '</h3><p>' + pick(s.desc) + '</p></div>';
    }).join("");
  }

  function renderTestimonials() {
    const el = document.getElementById("testimonials-track");
    if (!el) return;
    el.innerHTML = SITE.testimonials.map(function (tItem) {
      return '<div class="testimonial-card reveal">' +
        '<div class="testimonial-stars" aria-hidden="true">★★★★★</div>' +
        '<p>&ldquo;' + pick(tItem.text) + '&rdquo;</p>' +
        '<div class="testimonial-name">' + tItem.name + '</div></div>';
    }).join("");
  }

  function renderAbout() {
    const storyEl = document.getElementById("about-story");
    const photoEl = document.getElementById("about-photo-img");
    const badgesEl = document.getElementById("about-badges");
    if (storyEl) storyEl.textContent = pick(SITE.about.story);
    if (photoEl) { photoEl.src = SITE.about.photo; photoEl.alt = SITE.name; }
    if (badgesEl) {
      badgesEl.innerHTML = SITE.about.badges.map(function (b) {
        return '<span class="badge-pill">' + pick(b) + '</span>';
      }).join("");
    }
  }

  function renderHeroAndBrand() {
    document.querySelectorAll("[data-site-name]").forEach(function (el) { el.textContent = SITE.name; });
    document.querySelectorAll("[data-hero-title]").forEach(function (el) { el.textContent = pick(SITE.hero.title); });
    document.querySelectorAll("[data-hero-sub]").forEach(function (el) { el.textContent = pick(SITE.hero.subtitle); });
    document.querySelectorAll("[data-hero-eyebrow]").forEach(function (el) { el.textContent = pick(SITE.hero.eyebrow); });
    document.querySelectorAll("[data-tel-link]").forEach(function (el) {
      el.setAttribute("href", telLink());
      // Metin CSS ile gizlense bile ekran okuyucular için erişilebilir isim garanti edilir
      el.setAttribute("aria-label", t("btn_call") + ": " + SITE.phone);
    });
    document.querySelectorAll("[data-tel-text]").forEach(function (el) { el.textContent = SITE.phone; });
    document.querySelectorAll("[data-wa-link]").forEach(function (el) { el.setAttribute("href", waLink(t("wa_default_msg"))); });
    document.querySelectorAll("[data-region-text]").forEach(function (el) { el.textContent = pick(SITE.region); });
    if (SITE.map) {
      const mapFrame = document.getElementById("map-frame");
      const mapLink = document.getElementById("map-open-link");
      if (mapFrame && !mapFrame.getAttribute("src")) mapFrame.setAttribute("src", SITE.map.embedUrl);
      if (mapLink) mapLink.setAttribute("href", SITE.map.linkUrl);
    }
    const heroBgEl = document.getElementById("hero-bg");
    if (heroBgEl && SITE.hero.image && !heroBgEl.style.backgroundImage) {
      heroBgEl.style.backgroundImage = "url('" + SITE.hero.image + "')";
    }
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  let revealObserver = null;
  function observeReveals() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = document.querySelectorAll(".reveal:not(.is-visible)");
    if (reduceMotion) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
    }
    els.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Mobil nav toggle ---------- */
  function initNavToggle() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".main-nav ul");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      const open = nav.style.display === "flex";
      nav.style.display = open ? "none" : "flex";
      toggle.setAttribute("aria-expanded", String(!open));
    });
  }

  /* ---------- Init ---------- */
  function initHome() {
    renderStats();
    populateFilters();
    renderGrid();
    renderAbout();
    renderServices();
    renderTestimonials();
    ["filter-region", "filter-type", "filter-budget"].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", renderGrid);
    });
    const resetBtn = document.getElementById("filter-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        ["filter-region", "filter-type", "filter-budget"].forEach(function (id) {
          const el = document.getElementById(id);
          if (el) el.value = "";
        });
        renderGrid();
      });
    }
    observeReveals();
  }

  window.onLangChange = function () {
    renderHeroAndBrand();
    if (document.getElementById("property-grid")) initHome();
    if (typeof window.onLangChangeDetail === "function") window.onLangChangeDetail();
  };

  document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    applyLang();
    renderHeroAndBrand();
    if (document.getElementById("property-grid")) initHome();

    // ikonları statik data-icon slotlarına yerleştir
    document.querySelectorAll("[data-icon]").forEach(function (el) {
      const name = el.getAttribute("data-icon");
      if (ICONS[name]) el.innerHTML = ICONS[name];
    });
  });

  // Diğer scriptlerin kullanabilmesi için dışa aç
  window.SiteApp = { t: t, pick: pick, plural: plural, fmtPrice: fmtPrice, waLink: waLink, telLink: telLink, ICONS: ICONS, observeReveals: observeReveals, getLang: function () { return currentLang; } };
})();
