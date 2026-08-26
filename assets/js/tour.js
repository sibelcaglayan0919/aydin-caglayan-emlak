/* ============================================================
   TOUR.JS — Sanal gezinti (360° panorama veya gömülü platform turu)
   Sadece ilanda "tour" alanı doluysa devreye girer; yoksa hiçbir şey
   render etmez, hiçbir dosya yüklemez.
   ============================================================ */

(function () {
  "use strict";

  function app() { return window.SiteApp || {}; }
  function t(key) { return app().t ? app().t(key) : key; }
  function pick(field) { return app().pick ? app().pick(field) : ((field && (field.tr || field.en)) || ""); }
  function icon(name) { return (app().ICONS && app().ICONS[name]) || ""; }

  let pannellumLoading = null;
  function loadPannellum() {
    if (window.pannellum) return Promise.resolve();
    if (pannellumLoading) return pannellumLoading;
    pannellumLoading = new Promise(function (resolve, reject) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "assets/vendor/pannellum/pannellum.css";
      document.head.appendChild(css);
      const script = document.createElement("script");
      script.src = "assets/vendor/pannellum/pannellum.js";
      script.onload = function () { resolve(); };
      script.onerror = function () { reject(new Error("pannellum yüklenemedi")); };
      document.body.appendChild(script);
    });
    return pannellumLoading;
  }

  function sectionHtml(p) {
    if (!p || !p.tour) return "";
    return (
      '<div class="tour-section reveal">' +
        '<button type="button" class="btn btn-outline tour-toggle" id="tour-toggle" aria-expanded="false" aria-controls="tour-panel">' +
          icon("rotate360") + t("tour_start") +
        "</button>" +
        '<div class="tour-panel" id="tour-panel" hidden></div>' +
      "</div>"
    );
  }

  function mount(p) {
    const panel = document.getElementById("tour-panel");
    if (!panel || panel.dataset.mounted) return;
    panel.dataset.mounted = "1";

    if (p.tour.type === "embed" && p.tour.url) {
      panel.innerHTML = '<iframe class="tour-iframe" src="' + p.tour.url + '" title="' + t("tour_start") + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
      return;
    }

    if (p.tour.type === "360" && p.tour.scenes && p.tour.scenes.length) {
      const scenes = p.tour.scenes;
      const tabsHtml = scenes.length > 1
        ? '<div class="tour-tabs" role="tablist">' + scenes.map(function (s, i) {
            return '<button type="button" class="tour-tab' + (i === 0 ? " active" : "") + '" role="tab" aria-selected="' + (i === 0 ? "true" : "false") + '" data-scene="' + s.id + '">' + pick(s.title) + "</button>";
          }).join("") + "</div>"
        : "";
      panel.innerHTML = tabsHtml + '<div class="tour-viewer" id="tour-viewer"></div>';

      loadPannellum().then(function () {
        const pannellumScenes = {};
        scenes.forEach(function (s) {
          pannellumScenes[s.id] = { type: "equirectangular", panorama: s.image, title: pick(s.title), autoLoad: false };
        });
        const viewer = window.pannellum.viewer("tour-viewer", {
          default: { firstScene: scenes[0].id, sceneFadeDuration: 600 },
          scenes: pannellumScenes
        });
        panel.querySelectorAll(".tour-tab").forEach(function (tab) {
          tab.addEventListener("click", function () {
            panel.querySelectorAll(".tour-tab").forEach(function (b) {
              b.classList.remove("active");
              b.setAttribute("aria-selected", "false");
            });
            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");
            viewer.loadScene(tab.dataset.scene);
          });
        });
      }).catch(function () {
        panel.innerHTML = '<p class="tour-error">' + t("tour_error") + "</p>";
      });
    }
  }

  function wire(p) {
    if (!p || !p.tour) return;
    const btn = document.getElementById("tour-toggle");
    const panel = document.getElementById("tour-panel");
    if (!btn || !panel) return;
    btn.addEventListener("click", function () {
      const willOpen = panel.hidden;
      panel.hidden = !willOpen;
      btn.setAttribute("aria-expanded", String(willOpen));
      if (willOpen) mount(p);
    });
  }

  window.SiteTour = { sectionHtml: sectionHtml, wire: wire };
})();
