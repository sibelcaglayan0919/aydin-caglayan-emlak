/* ============================================================
   APPOINTMENT.JS — Randevu talebi modalı
   Talep bazlı akış: ziyaretçi gün + saat aralığı + iletişim bilgisi
   bırakır, /api/book-appointment'a POST edilir, danışman admin
   panelden onaylar. Başarıdan sonra WhatsApp'tan devam etme seçeneği
   de sunulur.

   chat.js ile aynı desen: IIFE, vanilla JS, SiteApp üzerinden i18n.
   ============================================================ */

(function () {
  "use strict";

  function app() { return window.SiteApp || {}; }
  function t(key) { return app().t ? app().t(key) : key; }
  function waLink(msg) { return app().waLink ? app().waLink(msg) : "#"; }
  function icon(name) { return (app().ICONS && app().ICONS[name]) || ""; }
  function lang() { return app().getLang ? app().getLang() : "tr"; }

  let overlayEl = null;
  let dialogEl = null;
  let formEl = null;
  let statusEl = null;
  let lastFocused = null;
  let context = { propertyId: null, propertyTitle: null };

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Tarih girişinin alt sınırı — geçmiş gün seçilemesin (sunucu da doğruluyor)
  function todayIso() {
    const now = new Date();
    const off = now.getTimezoneOffset();
    return new Date(now.getTime() - off * 60000).toISOString().slice(0, 10);
  }

  function fmtDate(iso) {
    try {
      return new Date(iso + "T00:00:00").toLocaleDateString(lang() === "tr" ? "tr-TR" : "en-US", {
        day: "numeric", month: "long", year: "numeric"
      });
    } catch (e) {
      return iso;
    }
  }

  /* ---------- Modal iskeleti ---------- */
  function buildModal() {
    overlayEl = document.createElement("div");
    overlayEl.className = "appt-overlay";
    overlayEl.hidden = true;

    dialogEl = document.createElement("div");
    dialogEl.className = "appt-dialog";
    dialogEl.setAttribute("role", "dialog");
    dialogEl.setAttribute("aria-modal", "true");
    dialogEl.setAttribute("aria-labelledby", "appt-heading");
    overlayEl.appendChild(dialogEl);

    // Backdrop tıklaması kapatır; dialog içindeki tıklama dışarı sızmasın
    overlayEl.addEventListener("click", function (e) {
      if (e.target === overlayEl) close();
    });
    overlayEl.addEventListener("keydown", onKeydown);

    document.body.appendChild(overlayEl);
  }

  function formHtml() {
    const propLine = context.propertyTitle
      ? '<p class="appt-property">' + escapeHtml(t("appt_for_property").replace("{title}", context.propertyTitle)) + "</p>"
      : "";

    return (
      '<div class="appt-header">' +
        '<h2 id="appt-heading">' + t("appt_modal_title") + "</h2>" +
        '<button type="button" class="appt-close" id="appt-close" aria-label="' + t("appt_close") + '">' + icon("close") + "</button>" +
      "</div>" +
      propLine +
      '<form id="appt-form" novalidate>' +
        '<div class="appt-field">' +
          '<label for="appt-name">' + t("appt_name") + "</label>" +
          '<input type="text" id="appt-name" name="name" autocomplete="name" required>' +
        "</div>" +
        '<div class="appt-field">' +
          '<label for="appt-phone">' + t("appt_phone") + "</label>" +
          '<input type="tel" id="appt-phone" name="phone" autocomplete="tel" required>' +
        "</div>" +
        '<div class="appt-field">' +
          '<label for="appt-email">' + t("appt_email") + "</label>" +
          '<input type="email" id="appt-email" name="email" autocomplete="email">' +
        "</div>" +
        '<div class="appt-field">' +
          '<label for="appt-date">' + t("appt_date") + "</label>" +
          '<input type="date" id="appt-date" name="preferred_date" min="' + todayIso() + '" required>' +
        "</div>" +
        '<fieldset class="appt-field appt-slots">' +
          "<legend>" + t("appt_slot") + "</legend>" +
          ["morning", "noon", "evening"].map(function (slot, i) {
            return (
              '<label class="appt-slot">' +
                '<input type="radio" name="time_slot" value="' + slot + '"' + (i === 0 ? " checked" : "") + ">" +
                "<span>" + t("appt_slot_" + slot) + "</span>" +
              "</label>"
            );
          }).join("") +
        "</fieldset>" +
        '<div class="appt-field">' +
          '<label for="appt-note">' + t("appt_note") + "</label>" +
          '<textarea id="appt-note" name="note" rows="3" placeholder="' + t("appt_note_ph") + '"></textarea>' +
        "</div>" +
        // Honeypot: gerçek ziyaretçi görmez, botlar doldurur (sunucu sessizce yutar)
        '<div class="appt-hp" aria-hidden="true">' +
          '<label for="appt-company">Company</label>' +
          '<input type="text" id="appt-company" name="company" tabindex="-1" autocomplete="off">' +
        "</div>" +
        '<button type="submit" class="btn btn-gold btn-block" id="appt-submit">' + t("appt_submit") + "</button>" +
        '<div class="appt-status" id="appt-status" role="status" aria-live="polite"></div>' +
      "</form>"
    );
  }

  function successHtml(value) {
    const dateText = fmtDate(value.preferred_date);
    const slotText = t("appt_slot_" + value.time_slot);
    const msgKey = context.propertyTitle ? "appt_wa_msg_property" : "appt_wa_msg";
    const waMsg = t(msgKey)
      .replace("{title}", context.propertyTitle || "")
      .replace("{date}", dateText)
      .replace("{slot}", slotText)
      .replace("{name}", value.name)
      .replace("{phone}", value.phone);

    return (
      '<div class="appt-header">' +
        '<h2 id="appt-heading">' + t("appt_success_title") + "</h2>" +
        '<button type="button" class="appt-close" id="appt-close" aria-label="' + t("appt_close") + '">' + icon("close") + "</button>" +
      "</div>" +
      '<div class="appt-success">' +
        "<p>" + escapeHtml(t("appt_success_text").replace("{date}", dateText).replace("{slot}", slotText)) + "</p>" +
        '<p class="appt-success-hint">' + t("appt_success_hint") + "</p>" +
        '<a class="btn btn-wa btn-block" href="' + escapeHtml(waLink(waMsg)) + '" target="_blank" rel="noopener">' +
          icon("whatsapp") + t("chat_continue_wa") +
        "</a>" +
        '<button type="button" class="btn btn-outline btn-block" id="appt-again">' + t("appt_new_request") + "</button>" +
      "</div>"
    );
  }

  function renderForm() {
    dialogEl.innerHTML = formHtml();
    formEl = dialogEl.querySelector("#appt-form");
    statusEl = dialogEl.querySelector("#appt-status");
    dialogEl.querySelector("#appt-close").addEventListener("click", close);
    formEl.addEventListener("submit", handleSubmit);
  }

  function renderSuccess(value) {
    dialogEl.innerHTML = successHtml(value);
    formEl = null;
    statusEl = null;
    dialogEl.querySelector("#appt-close").addEventListener("click", close);
    dialogEl.querySelector("#appt-again").addEventListener("click", function () {
      renderForm();
      focusFirst();
    });
  }

  function setStatus(msg, isError) {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.className = "appt-status" + (isError ? " appt-status--error" : "");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const value = {
      name: formEl.querySelector("#appt-name").value.trim(),
      phone: formEl.querySelector("#appt-phone").value.trim(),
      email: formEl.querySelector("#appt-email").value.trim(),
      preferred_date: formEl.querySelector("#appt-date").value,
      time_slot: (formEl.querySelector('input[name="time_slot"]:checked') || {}).value || "",
      note: formEl.querySelector("#appt-note").value.trim(),
      company: formEl.querySelector("#appt-company").value,
      property_id: context.propertyId || "",
      property_title: context.propertyTitle || "",
      lang: lang(),
    };

    if (!value.name || !value.phone || !value.preferred_date || !value.time_slot) {
      setStatus(t("appt_required_hint"), true);
      return;
    }

    const submitBtn = formEl.querySelector("#appt-submit");
    submitBtn.disabled = true;
    setStatus(t("appt_submitting"), false);

    try {
      const res = await fetch("/api/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      let data = null;
      try { data = await res.json(); } catch (err) { /* boş gövde olabilir */ }
      if (!res.ok) {
        const detail = data && (data.error || (data.errors && data.errors.join(" • ")));
        throw new Error(detail || t("appt_error"));
      }
      renderSuccess(value);
      focusFirst();
    } catch (err) {
      setStatus(err.message || t("appt_error"), true);
      submitBtn.disabled = false;
    }
  }

  /* ---------- Odak yönetimi ---------- */
  function focusables() {
    return Array.prototype.slice
      .call(dialogEl.querySelectorAll("button, input, textarea, select, a[href]"))
      .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
  }

  function focusFirst() {
    const list = focusables();
    // İlk sıradaki kapatma düğmesini atlayıp ilk anlamlı alana odaklan
    const target = list.find(function (el) { return el.id !== "appt-close"; }) || list[0];
    if (target) target.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape") { close(); return; }
    if (e.key !== "Tab") return;
    const list = focusables();
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  /* ---------- Aç / Kapat ---------- */
  function open(opts) {
    opts = opts || {};
    context = {
      propertyId: opts.propertyId || null,
      propertyTitle: opts.propertyTitle || null,
    };
    if (!overlayEl) buildModal();
    lastFocused = document.activeElement;
    renderForm();
    overlayEl.hidden = false;
    document.body.style.overflow = "hidden";
    focusFirst();
  }

  function close() {
    if (!overlayEl || overlayEl.hidden) return;
    overlayEl.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  // Dil değişince açık modal yeniden etiketlensin (form girdileri sıfırlanır)
  window.onLangChangeAppointment = function () {
    if (overlayEl && !overlayEl.hidden && formEl) renderForm();
  };

  window.AppointmentModal = { open: open, close: close };

  document.addEventListener("DOMContentLoaded", function () {
    const trigger = document.getElementById("appt-open");
    if (trigger) trigger.addEventListener("click", function () { open(); });
  });
})();
