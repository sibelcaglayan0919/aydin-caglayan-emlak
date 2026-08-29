/* ============================================================
   ADMIN.JS — Danışman girişi + ilan ekleme/düzenleme/silme paneli
   Framework yok, sitenin geri kalanıyla aynı desen (IIFE, vanilla JS).
   ============================================================ */

(function () {
  "use strict";

  const FACINGS = ["kuzey", "guney", "dogu", "bati", "kuzeydogu", "kuzeybati", "guneydogu", "guneybati"];
  const HEATINGS = ["kombi", "merkezi", "klima", "yerden", "soba"];

  let currentItems = [];
  let editingId = null; // null = yeni ilan modu

  function q(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmtPrice(price, currency) {
    try {
      return new Intl.NumberFormat("tr-TR").format(price) + " " + (currency === "TRY" ? "₺" : currency);
    } catch (e) {
      return price + " " + currency;
    }
  }

  function slugify(text) {
    const map = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u" };
    return String(text || "")
      .split("").map(function (ch) { return map[ch] || ch; }).join("")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60);
  }

  function setStatus(el, msg, isError) {
    el.textContent = msg || "";
    el.className = "admin-status" + (isError ? " admin-status--error" : msg ? " admin-status--ok" : "");
  }

  async function api(path, method, body) {
    const res = await fetch(path, {
      method: method || "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch (e) { /* boş gövde olabilir */ }
    if (!res.ok) {
      const msg = (data && (data.error || (data.errors && data.errors.join(" • ")))) || ("Hata (" + res.status + ")");
      throw new Error(msg);
    }
    return data;
  }

  // ---- Görsel küçültme (Canvas API, ek kütüphane yok) ----
  function resizeImageFile(file, maxEdge, quality) {
    return new Promise(function (resolve, reject) {
      const img = new Image();
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function () {
        img.onerror = reject;
        img.onload = function () {
          let w = img.naturalWidth, h = img.naturalHeight;
          const scale = Math.min(1, maxEdge / Math.max(w, h));
          w = Math.round(w * scale);
          h = Math.round(h * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // ---- Giriş / Oturum ----
  async function checkSession() {
    const data = await api("/api/session");
    return data && data.loggedIn;
  }

  function showLogin() {
    q("admin-login").hidden = false;
    q("admin-panel").hidden = true;
  }

  function showPanel() {
    q("admin-login").hidden = true;
    q("admin-panel").hidden = false;
    loadAppointments();
    loadListings();
  }

  async function handleLogin(e) {
    e.preventDefault();
    const username = q("login-username").value.trim();
    const password = q("login-password").value;
    setStatus(q("login-status"), "Giriş yapılıyor…", false);
    try {
      await api("/api/login", "POST", { username: username, password: password });
      setStatus(q("login-status"), "", false);
      showPanel();
    } catch (err) {
      setStatus(q("login-status"), err.message, true);
    }
  }

  async function handleLogout() {
    try { await api("/api/logout", "POST", {}); } catch (e) { /* yine de çıkış yap */ }
    showLogin();
  }

  // ---- İlan listesi ----
  async function loadListings() {
    setStatus(q("list-status"), "Yükleniyor…", false);
    try {
      const data = await api("/api/listings");
      currentItems = data.items || [];
      renderList();
      setStatus(q("list-status"), "", false);
    } catch (err) {
      setStatus(q("list-status"), err.message, true);
    }
  }

  function renderList() {
    const tbody = q("listings-tbody");
    tbody.innerHTML = "";
    if (currentItems.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">Henüz ilan yok.</td></tr>';
      return;
    }
    currentItems.forEach(function (p) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + escapeHtml(p.title.tr) + "</td>" +
        "<td>" + escapeHtml(fmtPrice(p.price, p.currency)) + "</td>" +
        "<td>" + escapeHtml(p.status) + "</td>" +
        '<td class="admin-row-actions">' +
        '<button type="button" class="admin-btn admin-btn--sm" data-edit="' + escapeHtml(p.id) + '">Düzenle</button>' +
        '<button type="button" class="admin-btn admin-btn--sm admin-btn--danger" data-delete="' + escapeHtml(p.id) + '">Sil</button>' +
        "</td>";
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll("[data-edit]").forEach(function (btn) {
      btn.addEventListener("click", function () { startEdit(btn.getAttribute("data-edit")); });
    });
    tbody.querySelectorAll("[data-delete]").forEach(function (btn) {
      btn.addEventListener("click", function () { handleDelete(btn.getAttribute("data-delete")); });
    });
  }

  async function handleDelete(id) {
    if (!confirm('"' + id + '" ilanını kalıcı olarak silmek istediğine emin misin? Bu işlem geri alınamaz.')) return;
    setStatus(q("list-status"), "Siliniyor…", false);
    try {
      await api("/api/delete-listing", "POST", { id: id });
      setStatus(q("list-status"), "Silindi. Site birkaç dakika içinde güncellenecek.", false);
      await loadListings();
    } catch (err) {
      setStatus(q("list-status"), err.message, true);
    }
  }

  // ---- Randevular ----
  const SLOT_LABELS = { morning: "Sabah (09–12)", noon: "Öğle (12–16)", evening: "Akşam (16–19)" };
  const STATUS_LABELS = { pending: "Beklemede", confirmed: "Onaylandı", cancelled: "İptal" };
  // Her durumdan hangi işlemlerin yapılabileceği
  const STATUS_ACTIONS = {
    pending: [{ to: "confirmed", label: "Onayla" }, { to: "cancelled", label: "İptal", danger: true }],
    confirmed: [{ to: "cancelled", label: "İptal", danger: true }],
    cancelled: [{ to: "pending", label: "Beklemeye al" }],
  };

  function fmtApptDate(iso) {
    if (!iso) return "";
    try {
      return new Date(iso + "T00:00:00").toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
    } catch (e) {
      return iso;
    }
  }

  async function loadAppointments() {
    setStatus(q("appts-status"), "Yükleniyor…", false);
    try {
      const data = await api("/api/appointments");
      renderAppointments(data.items || []);
      setStatus(q("appts-status"), "", false);
    } catch (err) {
      setStatus(q("appts-status"), err.message, true);
    }
  }

  function renderAppointments(items) {
    const tbody = q("appts-tbody");
    tbody.innerHTML = "";
    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">Henüz randevu talebi yok.</td></tr>';
      return;
    }

    items.forEach(function (a) {
      const actions = STATUS_ACTIONS[a.status] || [];
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + escapeHtml(fmtApptDate(a.preferred_date)) + "</td>" +
        "<td>" + escapeHtml(SLOT_LABELS[a.time_slot] || a.time_slot || "") + "</td>" +
        '<td' + (a.note ? ' title="' + escapeHtml(a.note) + '"' : "") + ">" + escapeHtml(a.name) +
          (a.email ? '<br><small>' + escapeHtml(a.email) + "</small>" : "") +
          (a.note ? ' <span aria-label="Not var">📝</span>' : "") +
        "</td>" +
        '<td><a href="tel:' + escapeHtml(a.phone) + '">' + escapeHtml(a.phone) + "</a></td>" +
        "<td>" + escapeHtml(a.property_title || "—") + "</td>" +
        '<td><span class="admin-badge admin-badge--' + escapeHtml(a.status) + '">' +
          escapeHtml(STATUS_LABELS[a.status] || a.status) + "</span></td>" +
        '<td class="admin-row-actions">' +
          actions.map(function (act) {
            return '<button type="button" class="admin-btn admin-btn--sm' + (act.danger ? " admin-btn--danger" : "") +
              '" data-appt-id="' + escapeHtml(a.id) + '" data-appt-status="' + act.to + '">' + act.label + "</button>";
          }).join("") +
        "</td>";
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll("[data-appt-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setApptStatus(btn.getAttribute("data-appt-id"), btn.getAttribute("data-appt-status"));
      });
    });
  }

  async function setApptStatus(id, status) {
    setStatus(q("appts-status"), "Güncelleniyor…", false);
    try {
      await api("/api/update-appointment", "POST", { id: id, status: status });
      await loadAppointments();
      setStatus(q("appts-status"), "Güncellendi.", false);
    } catch (err) {
      setStatus(q("appts-status"), err.message, true);
    }
  }

  // ---- Ekle / Düzenle formu ----
  function resetForm() {
    editingId = null;
    q("form-title").textContent = "Yeni İlan Ekle";
    q("listing-form").reset();
    q("field-id").disabled = false;
    q("photo-preview").innerHTML = "";
    q("photo-input").value = "";
    setStatus(q("form-status"), "", false);
  }

  function startEdit(id) {
    const p = currentItems.find(function (x) { return x.id === id; });
    if (!p) return;
    editingId = id;
    q("form-title").textContent = "İlanı Düzenle: " + p.title.tr;
    q("field-id").value = p.id;
    q("field-id").disabled = true;
    q("field-title-tr").value = p.title.tr;
    q("field-title-en").value = p.title.en;
    q("field-desc-tr").value = p.desc.tr;
    q("field-desc-en").value = p.desc.en;
    q("field-price").value = p.price;
    q("field-currency").value = p.currency;
    q("field-status").value = p.status;
    q("field-type").value = p.type;
    q("field-location-tr").value = p.location.tr;
    q("field-location-en").value = p.location.en;
    q("field-beds").value = p.beds;
    q("field-baths").value = p.baths;
    q("field-area").value = p.area;
    q("field-featured").checked = !!p.featured;
    q("field-floor").value = (p.details && p.details.floor) || "";
    q("field-total-floors").value = (p.details && p.details.totalFloors) || "";
    q("field-building-age").value = (p.details && p.details.buildingAge) || "";
    q("field-facing").value = (p.details && p.details.facing) || "";
    q("field-heating").value = (p.details && p.details.heating) || "";
    q("photo-preview").innerHTML = (p.images || [])
      .map(function (src) { return '<img src="../' + src + '" alt="">'; })
      .join("");
    q("photo-input").value = "";
    setStatus(q("form-status"), "", false);
    q("listing-form").scrollIntoView({ behavior: "smooth" });
  }

  function collectDetails() {
    const details = {};
    if (q("field-floor").value !== "") details.floor = Number(q("field-floor").value);
    if (q("field-total-floors").value !== "") details.totalFloors = Number(q("field-total-floors").value);
    if (q("field-building-age").value !== "") details.buildingAge = Number(q("field-building-age").value);
    if (q("field-facing").value) details.facing = q("field-facing").value;
    if (q("field-heating").value) details.heating = q("field-heating").value;
    return details;
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    const isEdit = !!editingId;
    const id = isEdit ? editingId : slugify(q("field-id").value || q("field-title-tr").value);

    const payload = {
      id: id,
      title: { tr: q("field-title-tr").value.trim(), en: q("field-title-en").value.trim() },
      desc: { tr: q("field-desc-tr").value.trim(), en: q("field-desc-en").value.trim() },
      price: Number(q("field-price").value),
      currency: q("field-currency").value.trim() || "TRY",
      status: q("field-status").value,
      type: q("field-type").value,
      location: { tr: q("field-location-tr").value.trim(), en: q("field-location-en").value.trim() },
      beds: Number(q("field-beds").value),
      baths: Number(q("field-baths").value),
      area: Number(q("field-area").value),
      featured: q("field-featured").checked,
      details: collectDetails(),
    };

    const fileInput = q("photo-input");
    const files = Array.from(fileInput.files || []);

    setStatus(q("form-status"), "Kaydediliyor…", false);
    q("form-submit").disabled = true;

    try {
      let imagePaths = isEdit ? null : [];
      let startIndex = 1;

      if (isEdit) {
        const existing = currentItems.find(function (x) { return x.id === id; });
        startIndex = existing && existing.images ? existing.images.length + 1 : 1;
        imagePaths = existing ? existing.images.slice() : [];
      }

      if (files.length > 0) {
        setStatus(q("form-status"), "Fotoğraflar yükleniyor (0/" + files.length + ")…", false);
        for (let i = 0; i < files.length; i++) {
          const dataUrl = await resizeImageFile(files[i], 900, 0.78);
          const result = await api("/api/upload-photo", "POST", { id: id, index: startIndex + i, dataUrl: dataUrl });
          imagePaths.push(result.path);
          setStatus(q("form-status"), "Fotoğraflar yükleniyor (" + (i + 1) + "/" + files.length + ")…", false);
        }
      }

      payload.images = imagePaths;

      setStatus(q("form-status"), "İlan kaydediliyor…", false);
      if (isEdit) {
        await api("/api/edit-listing", "POST", payload);
      } else {
        await api("/api/add-listing", "POST", payload);
      }

      setStatus(q("form-status"), "Kaydedildi! Site birkaç dakika içinde güncellenecek.", false);
      resetForm();
      await loadListings();
    } catch (err) {
      setStatus(q("form-status"), err.message, true);
    } finally {
      q("form-submit").disabled = false;
    }
  }

  function initFacingHeatingOptions() {
    const facingSel = q("field-facing");
    const heatingSel = q("field-heating");
    FACINGS.forEach(function (f) {
      const opt = document.createElement("option");
      opt.value = f; opt.textContent = f;
      facingSel.appendChild(opt);
    });
    HEATINGS.forEach(function (h) {
      const opt = document.createElement("option");
      opt.value = h; opt.textContent = h;
      heatingSel.appendChild(opt);
    });
  }

  function initPhotoPreview() {
    q("photo-input").addEventListener("change", async function () {
      const files = Array.from(this.files || []);
      const preview = q("photo-preview");
      preview.innerHTML = "";
      for (const file of files) {
        const dataUrl = await resizeImageFile(file, 300, 0.7);
        const img = document.createElement("img");
        img.src = dataUrl;
        preview.appendChild(img);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async function () {
    q("login-form").addEventListener("submit", handleLogin);
    q("logout-btn").addEventListener("click", handleLogout);
    q("listing-form").addEventListener("submit", handleFormSubmit);
    q("form-cancel").addEventListener("click", resetForm);
    q("appts-refresh").addEventListener("click", loadAppointments);
    initFacingHeatingOptions();
    initPhotoPreview();

    const loggedIn = await checkSession().catch(function () { return false; });
    if (loggedIn) showPanel(); else showLogin();
  });
})();
