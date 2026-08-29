/* ============================================================
   CHAT.JS — Scriptli asistan (yapay zeka DEĞİL, API anahtarı yok)
   Anahtar kelime eşleştirmesiyle çalışır, cevapları canlı PROPERTIES
   ve SITE verisinden üretir, anlayamadığında WhatsApp'a devreder.
   ============================================================ */

(function () {
  "use strict";

  function app() { return window.SiteApp || {}; }
  function t(key) { return app().t ? app().t(key) : key; }
  function pick(field) { return app().pick ? app().pick(field) : ((field && (field.tr || field.en)) || ""); }
  function plural(count, key) { return app().plural ? app().plural(count, key) : t(key); }
  function fmtPrice(num, currency) { return app().fmtPrice ? app().fmtPrice(num, currency) : num; }
  function waLink(msg) { return app().waLink ? app().waLink(msg) : "#"; }
  function icon(name) { return (app().ICONS && app().ICONS[name]) || ""; }

  let panelEl = null;
  let toggleBtn = null;
  let messagesEl = null;
  let formEl = null;
  let inputEl = null;
  let lastFocused = null;
  let started = false;

  /* ---------- Metin normalize (TR aksan/karakter duyarsız eşleştirme) ---------- */
  // ̀-ͯ = Unicode "Combining Diacritical Marks" bloğu (NFD sonrası aksanları temizler)
  const DIACRITIC_MARKS = new RegExp("[̀-ͯ]", "g");
  function normalize(str) {
    return (str || "")
      .toLocaleLowerCase("tr")
      .replace(/ı/g, "i")
      .normalize("NFD").replace(DIACRITIC_MARKS, "")
      .trim();
  }

  /* ---------- Bağlam: hangi ilandan bahsediyoruz ---------- */
  function currentProperty() {
    if (typeof PROPERTIES === "undefined" || !PROPERTIES.length) return null;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      const found = PROPERTIES.find(function (x) { return x.id === id; });
      if (found) return found;
    }
    return PROPERTIES.find(function (x) { return x.featured; }) || PROPERTIES[0];
  }

  function detailsSummary(p) {
    const rows = app().detailsRows ? app().detailsRows(p) : [];
    if (!rows.length) return null;
    return rows.map(function (r) { return r.label + ": " + r.value; }).join(" · ");
  }

  /* ---------- Niyetler ---------- */
  const INTENTS = [
    {
      name: "greeting",
      keywords: ["merhaba", "selam", "gunaydin", "iyi gunler", "iyi aksamlar", "hello", "hi ", "hey"],
      respond: function () { return { text: t("chat_a_greeting") }; }
    },
    {
      name: "thanks",
      keywords: ["tesekkur", "sagol", "eyvallah", "thanks", "thank you"],
      respond: function () { return { text: t("chat_a_thanks") }; }
    },
    {
      name: "price",
      keywords: ["fiyat", "kac para", "ne kadar", "tutari", "price", "cost", "how much"],
      respond: function (p) {
        if (!p) return { text: t("chat_a_no_property") };
        return { text: t("chat_a_price").replace("{title}", pick(p.title)).replace("{price}", fmtPrice(p.price, p.currency)) };
      }
    },
    {
      name: "specs",
      keywords: ["metrekare", "m2", "kac oda", "kac metre", "oda sayisi", "bedroom", "sqm", "kac banyo", "square meter"],
      respond: function (p) {
        if (!p) return { text: t("chat_a_no_property") };
        return {
          text: t("chat_a_specs")
            .replace("{title}", pick(p.title))
            .replace("{area}", p.area)
            .replace("{beds}", p.beds + " " + plural(p.beds, "beds"))
            .replace("{baths}", p.baths + " " + plural(p.baths, "baths"))
        };
      }
    },
    {
      name: "location",
      keywords: ["nerede", "hangi bolge", "konum", "adres", "location", "where is", "address"],
      respond: function (p) {
        if (!p) return { text: t("chat_a_no_property") };
        return { text: t("chat_a_location").replace("{title}", pick(p.title)).replace("{location}", pick(p.location)) };
      }
    },
    {
      name: "details",
      keywords: ["kat", "bina yasi", "cephe", "isitma", "yapim yili", "floor", "building age", "facing", "heating"],
      respond: function (p) {
        if (!p) return { text: t("chat_a_no_property") };
        const summary = detailsSummary(p);
        return { text: summary ? t("chat_a_details").replace("{title}", pick(p.title)).replace("{details}", summary) : t("chat_a_no_details") };
      }
    },
    {
      name: "tour",
      keywords: ["sanal gezinti", "sanal tur", "360", "panorama", "virtual tour"],
      respond: function (p) {
        if (!p) return { text: t("chat_a_no_property") };
        return { text: p.tour ? t("chat_a_tour_yes").replace("{title}", pick(p.title)) : t("chat_a_tour_no") };
      }
    },
    {
      name: "listings",
      keywords: ["ilan", "portfoy", "baska ilan", "listings", "properties", "what do you have"],
      respond: function () {
        if (typeof PROPERTIES === "undefined" || !PROPERTIES.length) return { text: t("chat_a_no_property") };
        const list = PROPERTIES.map(function (p) { return "• " + pick(p.title) + " — " + fmtPrice(p.price, p.currency); }).join("\n");
        return { text: t("chat_a_listings") + "\n" + list };
      }
    },
    {
      name: "appointment",
      keywords: ["randevu", "gormek istiyorum", "ziyaret", "yerinde gor", "appointment", "viewing", "visit"],
      respond: function () { return { text: t("chat_a_appointment"), handoff: true, openAppt: true }; }
    },
    {
      name: "contact",
      keywords: ["telefon", "numara", "nasil ulasirim", "iletisim", "phone", "contact number", "call"],
      respond: function () { return { text: t("chat_a_contact").replace("{phone}", (typeof SITE !== "undefined" ? SITE.phone : "")) }; }
    }
  ];

  function matchIntent(text) {
    const n = normalize(text);
    for (let i = 0; i < INTENTS.length; i++) {
      const hit = INTENTS[i].keywords.some(function (kw) { return n.indexOf(normalize(kw)) !== -1; });
      if (hit) return INTENTS[i];
    }
    return null;
  }

  /* ---------- Mesaj ekleme ---------- */
  function addMessage(text, who, handoffMsg) {
    const row = document.createElement("div");
    row.className = "chat-msg chat-msg-" + who;
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = text;
    row.appendChild(bubble);
    if (who === "bot") {
      const link = document.createElement("a");
      link.className = "chat-wa-link";
      link.href = waLink(handoffMsg || t("wa_default_msg"));
      link.target = "_blank";
      link.rel = "noopener";
      link.innerHTML = icon("whatsapp") + t("chat_continue_wa");
      row.appendChild(link);
    }
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function handleUserText(text) {
    if (!text.trim()) return;
    addMessage(text, "user");
    const p = currentProperty();
    const intent = matchIntent(text);
    let reply, handoffMsg, openAppt = false;
    if (intent) {
      const result = intent.respond(p);
      reply = result.text;
      openAppt = !!result.openAppt;
      handoffMsg = p ? t("wa_property_msg").replace("{title}", pick(p.title)) : t("wa_default_msg");
    } else {
      reply = t("chat_a_fallback");
      handoffMsg = p ? t("wa_property_msg").replace("{title}", pick(p.title)) : t("wa_default_msg");
    }
    window.setTimeout(function () {
      addMessage(reply, "bot", handoffMsg);
      // Randevu niyetinde formu doğrudan aç — iki dialog üst üste kalmasın diye
      // sohbet paneli kapatılır. Bubble'daki WhatsApp bağlantısı yedek olarak kalır.
      if (openAppt && window.AppointmentModal) {
        close();
        window.AppointmentModal.open(p ? { propertyId: p.id, propertyTitle: pick(p.title) } : {});
      }
    }, 260);
  }

  /* ---------- Panel iskeleti ---------- */
  function buildPanel() {
    panelEl = document.createElement("div");
    panelEl.className = "chat-panel";
    panelEl.setAttribute("role", "dialog");
    panelEl.setAttribute("aria-modal", "true");
    panelEl.setAttribute("aria-label", t("chat_title"));
    panelEl.hidden = true;

    panelEl.innerHTML =
      '<div class="chat-header">' +
        '<span class="chat-header-title">' + t("chat_title") + "</span>" +
        '<button type="button" class="chat-close" id="chat-close" aria-label="' + t("chat_close_label") + '">' + icon("close") + "</button>" +
      "</div>" +
      '<div class="chat-messages" id="chat-messages" aria-live="polite"></div>' +
      '<div class="chat-quick" id="chat-quick"></div>' +
      '<form class="chat-form" id="chat-form">' +
        '<label class="sr-only" for="chat-input">' + t("chat_placeholder") + "</label>" +
        '<input type="text" id="chat-input" class="chat-input" placeholder="' + t("chat_placeholder") + '" autocomplete="off">' +
        '<button type="submit" class="chat-send" aria-label="' + t("chat_send") + '">' + icon("send") + "</button>" +
      "</form>";

    document.body.appendChild(panelEl);
    messagesEl = panelEl.querySelector("#chat-messages");
    formEl = panelEl.querySelector("#chat-form");
    inputEl = panelEl.querySelector("#chat-input");

    panelEl.querySelector("#chat-close").addEventListener("click", close);
    panelEl.addEventListener("keydown", onKeydown);
    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      const val = inputEl.value;
      inputEl.value = "";
      handleUserText(val);
    });

    renderQuickReplies();
  }

  function renderQuickReplies() {
    const quickEl = panelEl.querySelector("#chat-quick");
    const p = currentProperty();
    const chips = [
      { key: "chat_quick_price", enabled: true },
      { key: "chat_quick_location", enabled: true },
      { key: "chat_quick_tour", enabled: !!(p && p.tour) },
      { key: "chat_quick_appointment", enabled: true }
    ].filter(function (c) { return c.enabled; });
    quickEl.innerHTML = chips.map(function (c) {
      return '<button type="button" class="chat-chip" data-chip="' + c.key + '">' + t(c.key) + "</button>";
    }).join("");
    quickEl.querySelectorAll("[data-chip]").forEach(function (btn) {
      btn.addEventListener("click", function () { handleUserText(t(btn.dataset.chip)); });
    });
  }

  function greet() {
    if (started) return;
    started = true;
    const p = currentProperty();
    const greeting = p ? t("chat_greeting_property").replace("{title}", pick(p.title)) : t("chat_greeting_general");
    addMessage(greeting, "bot", p ? t("wa_property_msg").replace("{title}", pick(p.title)) : t("wa_default_msg"));
  }

  function onKeydown(e) {
    if (e.key === "Escape") { close(); return; }
    if (e.key !== "Tab") return;
    const focusable = Array.prototype.slice.call(panelEl.querySelectorAll("button, input, a[href]")).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  function open() {
    if (!panelEl) buildPanel();
    lastFocused = document.activeElement;
    panelEl.hidden = false;
    toggleBtn.setAttribute("aria-expanded", "true");
    greet();
    inputEl.focus();
  }

  function close() {
    if (!panelEl || panelEl.hidden) return;
    panelEl.hidden = true;
    toggleBtn.setAttribute("aria-expanded", "false");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    else toggleBtn.focus();
  }

  function buildToggle() {
    toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "chat-toggle";
    toggleBtn.id = "chat-toggle";
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-label", t("chat_open_label"));
    toggleBtn.innerHTML = icon("chat");
    toggleBtn.addEventListener("click", function () {
      if (panelEl && !panelEl.hidden) close(); else open();
    });
    document.body.appendChild(toggleBtn);
  }

  function relabel() {
    if (!toggleBtn) return;
    toggleBtn.setAttribute("aria-label", t("chat_open_label"));
    if (panelEl) {
      panelEl.setAttribute("aria-label", t("chat_title"));
      panelEl.querySelector(".chat-header-title").textContent = t("chat_title");
      panelEl.querySelector("#chat-close").setAttribute("aria-label", t("chat_close_label"));
      panelEl.querySelector("#chat-input").placeholder = t("chat_placeholder");
      panelEl.querySelector(".chat-send").setAttribute("aria-label", t("chat_send"));
      renderQuickReplies();
    }
  }

  window.onLangChangeChat = relabel;

  document.addEventListener("DOMContentLoaded", function () {
    buildToggle();
  });
})();
