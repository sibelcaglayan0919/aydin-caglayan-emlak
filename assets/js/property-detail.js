/* ============================================================
   PROPERTY-DETAIL.JS — ilan.html sayfası render mantığı
   URL: ilan.html?id=<property.id>
   ============================================================ */

(function () {
  "use strict";

  function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function findProperty(id) {
    return PROPERTIES.find(function (p) { return p.id === id; });
  }

  function galleryHtml(p) {
    const imgs = p.images.slice(0, 5);
    return imgs.map(function (src, i) {
      return '<img src="' + src + '" alt="' + window.SiteApp.pick(p.title) + ' - ' + (i + 1) + '" loading="' + (i === 0 ? "eager" : "lazy") + '" width="600" height="450">';
    }).join("");
  }

  function renderDetail() {
    const app = window.SiteApp;
    const id = getIdFromUrl();
    const p = id ? findProperty(id) : null;
    const contentEl = document.getElementById("detail-content");
    const notFoundEl = document.getElementById("not-found");

    if (!p) {
      if (contentEl) contentEl.style.display = "none";
      if (notFoundEl) notFoundEl.style.display = "block";
      return;
    }
    if (notFoundEl) notFoundEl.style.display = "none";
    if (contentEl) contentEl.style.display = "block";

    document.title = app.pick(p.title) + " | " + (typeof SITE !== "undefined" ? SITE.name : "");

    const waMsg = app.t("wa_property_msg").replace("{title}", app.pick(p.title));
    const waHref = app.waLink(waMsg);

    contentEl.innerHTML =
      '<div class="detail-gallery">' + galleryHtml(p) + '</div>' +
      '<div class="detail-head">' +
        '<div>' +
          '<span class="detail-status">' + app.t("status_" + p.status) + '</span>' +
          '<h1>' + app.pick(p.title) + '</h1>' +
          '<div class="property-loc">' + app.ICONS.pin + '<span>' + app.pick(p.location) + '</span></div>' +
        '</div>' +
        '<div class="detail-price">' + app.fmtPrice(p.price, p.currency) + '</div>' +
      '</div>' +
      '<div class="detail-summary">' +
        '<div><strong>' + p.beds + '</strong><span>' + app.plural(p.beds, "beds") + '</span></div>' +
        '<div><strong>' + p.baths + '</strong><span>' + app.plural(p.baths, "baths") + '</span></div>' +
        '<div><strong>' + p.area + '</strong><span>' + app.t("area") + '</span></div>' +
        '<div><strong>' + app.t("type_" + p.type) + '</strong><span>' + app.t("detail_summary_type") + '</span></div>' +
      '</div>' +
      '<div class="detail-layout">' +
        '<div><p style="font-size:1.02rem; color:var(--text);">' + app.pick(p.desc) + '</p></div>' +
        '<aside class="agent-card">' +
          '<img src="' + (typeof SITE !== "undefined" ? SITE.about.photo : "") + '" alt="' + (typeof SITE !== "undefined" ? SITE.name : "") + '">' +
          '<h3>' + (typeof SITE !== "undefined" ? SITE.name : "") + '</h3>' +
          '<div class="role">' + app.t("agent_role") + '</div>' +
          '<a class="btn btn-wa btn-block" href="' + waHref + '" target="_blank" rel="noopener">' + app.ICONS.whatsapp + app.t("btn_whatsapp") + '</a>' +
          '<a class="btn btn-outline btn-block" href="' + app.telLink() + '">' + app.ICONS.phone + app.t("btn_call") + '</a>' +
        '</aside>' +
      '</div>';

    const mobileWa = document.getElementById("mobile-wa");
    if (mobileWa) mobileWa.setAttribute("href", waHref);

    renderSimilar(p);
    app.observeReveals();
  }

  function renderSimilar(current) {
    const app = window.SiteApp;
    const others = PROPERTIES.filter(function (p) { return p.id !== current.id; }).slice(0, 3);
    const section = document.getElementById("similar-section");
    const grid = document.getElementById("similar-grid");
    if (!section || !grid) return;
    if (others.length === 0) { section.style.display = "none"; return; }
    section.style.display = "block";

    grid.innerHTML = others.map(function (p) {
      const img = p.images && p.images[0] ? p.images[0] : "";
      const msg = app.t("wa_property_msg").replace("{title}", app.pick(p.title));
      return (
        '<article class="property-card reveal">' +
          '<a href="ilan.html?id=' + encodeURIComponent(p.id) + '" class="property-media">' +
            '<span class="property-badge">' + app.t("status_" + p.status) + '</span>' +
            '<img src="' + img + '" alt="' + app.pick(p.title) + '" loading="lazy" width="480" height="360">' +
          '</a>' +
          '<div class="property-body">' +
            '<h3 class="property-title">' + app.pick(p.title) + '</h3>' +
            '<div class="property-price">' + app.fmtPrice(p.price, p.currency) + '</div>' +
            '<div class="property-actions">' +
              '<a class="btn btn-wa btn-sm" href="' + app.waLink(msg) + '" target="_blank" rel="noopener">' + app.ICONS.whatsapp + app.t("btn_whatsapp") + '</a>' +
              '<a class="btn btn-outline btn-sm" href="ilan.html?id=' + encodeURIComponent(p.id) + '">' + app.t("btn_detail") + '</a>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    // app.js DOMContentLoaded'ı önce çalışır (script sırası), SiteApp hazır olmalı
    renderDetail();
  });

  window.onLangChangeDetail = renderDetail;
})();
