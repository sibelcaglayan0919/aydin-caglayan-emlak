/* ============================================================
   LIGHTBOX.JS — Tam ekran fotoğraf galerisi
   Herhangi bir sayfadan window.SiteLightbox.open(images, startIndex, titleText)
   çağrısıyla kullanılır. DOM'u ilk açılışta tek seferlik oluşturur.
   ============================================================ */

(function () {
  "use strict";

  let overlay = null;
  let imgEl = null;
  let counterEl = null;
  let closeBtn = null;
  let prevBtn = null;
  let nextBtn = null;
  let images = [];
  let index = 0;
  let titleText = "";
  let lastFocused = null;
  let touchStartX = null;

  function app() { return window.SiteApp || {}; }
  function t(key) { return app().t ? app().t(key) : key; }
  function icon(name) { return (app().ICONS && app().ICONS[name]) || ""; }

  function build() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", t("lightbox_label"));
    overlay.hidden = true;

    overlay.innerHTML =
      '<button type="button" class="lightbox-close" data-lb="close">' + icon("close") + '<span class="sr-only">' + t("lightbox_close") + "</span></button>" +
      '<button type="button" class="lightbox-nav lightbox-prev" data-lb="prev">' + icon("chevronLeft") + '<span class="sr-only">' + t("lightbox_prev") + "</span></button>" +
      '<figure class="lightbox-figure">' +
        '<img class="lightbox-img" alt="">' +
        '<figcaption class="lightbox-counter"></figcaption>' +
      "</figure>" +
      '<button type="button" class="lightbox-nav lightbox-next" data-lb="next">' + icon("chevronRight") + '<span class="sr-only">' + t("lightbox_next") + "</span></button>";

    document.body.appendChild(overlay);
    imgEl = overlay.querySelector(".lightbox-img");
    counterEl = overlay.querySelector(".lightbox-counter");
    closeBtn = overlay.querySelector('[data-lb="close"]');
    prevBtn = overlay.querySelector('[data-lb="prev"]');
    nextBtn = overlay.querySelector('[data-lb="next"]');

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () { go(-1); });
    nextBtn.addEventListener("click", function () { go(1); });

    overlay.addEventListener("keydown", onKeydown);
    overlay.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    overlay.addEventListener("touchend", function (e) {
      if (touchStartX == null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) go(dx > 0 ? -1 : 1);
      touchStartX = null;
    }, { passive: true });
  }

  function render() {
    const src = images[index];
    imgEl.src = src;
    imgEl.alt = titleText ? titleText + " — " + (index + 1) : "";
    counterEl.textContent = (index + 1) + " / " + images.length;
    const multi = images.length > 1;
    prevBtn.hidden = !multi;
    nextBtn.hidden = !multi;
  }

  function go(delta) {
    if (images.length < 2) return;
    index = (index + delta + images.length) % images.length;
    render();
  }

  function onKeydown(e) {
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); go(-1); return; }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); go(1); return; }
    if (e.key === "Tab") {
      // Basit odak tuzağı: kapat / önceki / sonraki arasında döngü
      const focusable = [closeBtn, !prevBtn.hidden ? prevBtn : null, !nextBtn.hidden ? nextBtn : null].filter(Boolean);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }

  function open(imgs, startIndex, title) {
    if (!imgs || imgs.length === 0) return;
    build();
    images = imgs;
    index = Math.min(Math.max(startIndex || 0, 0), imgs.length - 1);
    titleText = title || "";
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    render();
    closeBtn.focus();
  }

  function close() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  window.SiteLightbox = { open: open, close: close };
})();
