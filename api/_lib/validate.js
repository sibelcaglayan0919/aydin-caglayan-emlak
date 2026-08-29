/* ============================================================
   validate.js — ilan formu alan doğrulama
   ============================================================ */

const ID_RE = /^[a-z0-9-]{3,60}$/;
const STATUSES = ["sale", "rent", "sold"];
const TYPES = ["villa", "daire", "arsa", "isyeri"];
const FACINGS = ["kuzey", "guney", "dogu", "bati", "kuzeydogu", "kuzeybati", "guneydogu", "guneybati"];
const HEATINGS = ["kombi", "merkezi", "klima", "yerden", "soba"];

function trEn(value, fieldName, errors) {
  if (!value || typeof value !== "object" || typeof value.tr !== "string" || typeof value.en !== "string") {
    errors.push(fieldName + ": tr/en alanları (metin) zorunlu.");
    return { tr: "", en: "" };
  }
  const tr = value.tr.trim();
  const en = value.en.trim();
  if (!tr) errors.push(fieldName + ".tr boş olamaz.");
  if (!en) errors.push(fieldName + ".en boş olamaz.");
  return { tr: tr, en: en };
}

function num(value, fieldName, errors, opts) {
  const n = Number(value);
  if (!isFinite(n) || (opts && opts.positive && n <= 0) || (opts && !opts.allowNegative && n < 0)) {
    errors.push(fieldName + ": geçerli bir sayı olmalı.");
    return 0;
  }
  return n;
}

// data: admin formundan gelen ham obje. Döner: { errors: [...], value: temizlenmiş obje }
function validateListing(data, existingIds, opts) {
  opts = opts || {};
  const errors = [];
  if (!data || typeof data !== "object") return { errors: ["Geçersiz veri."] };

  const out = {};

  if (!opts.isEdit) {
    const id = String(data.id || "").trim().toLowerCase();
    if (!ID_RE.test(id)) errors.push("id: yalnızca küçük harf, rakam ve tire (-) içermeli, 3-60 karakter.");
    if (existingIds && existingIds.indexOf(id) !== -1) errors.push("id: bu id zaten kullanılıyor.");
    out.id = id;
  }

  out.title = trEn(data.title, "title", errors);
  out.desc = trEn(data.desc, "desc", errors);
  out.price = num(data.price, "price", errors, { positive: true });
  out.currency = (String(data.currency || "TRY").trim().toUpperCase()) || "TRY";

  const status = String(data.status || "").trim();
  if (STATUSES.indexOf(status) === -1) errors.push("status: sale | rent | sold olmalı.");
  out.status = status;

  const type = String(data.type || "").trim();
  if (TYPES.indexOf(type) === -1) errors.push("type: villa | daire | arsa | isyeri olmalı.");
  out.type = type;

  out.location = trEn(data.location, "location", errors);
  out.beds = Math.round(num(data.beds, "beds", errors));
  out.baths = Math.round(num(data.baths, "baths", errors));
  out.area = num(data.area, "area", errors, { positive: true });
  out.featured = !!data.featured;

  if (data.details && typeof data.details === "object") {
    const d = {};
    if (data.details.floor !== undefined && data.details.floor !== "") d.floor = Math.round(Number(data.details.floor));
    if (data.details.totalFloors !== undefined && data.details.totalFloors !== "") d.totalFloors = Math.round(Number(data.details.totalFloors));
    if (data.details.buildingAge !== undefined && data.details.buildingAge !== "") d.buildingAge = Math.round(Number(data.details.buildingAge));
    if (data.details.facing && FACINGS.indexOf(data.details.facing) !== -1) d.facing = data.details.facing;
    if (data.details.heating && HEATINGS.indexOf(data.details.heating) !== -1) d.heating = data.details.heating;
    if (Object.keys(d).length > 0) out.details = d;
  }

  if (data.tour && typeof data.tour === "object" && data.tour.type === "embed" && data.tour.url) {
    const tourUrl = String(data.tour.url).trim();
    if (!/^https:\/\//i.test(tourUrl)) {
      errors.push("tour.url: yalnızca https:// ile başlayan bir adres olmalı.");
    } else {
      out.tour = { type: "embed", url: tourUrl };
    }
  }

  return { errors: errors, value: out };
}

/* ---------- Randevu talebi ---------- */

const TIME_SLOTS = ["morning", "noon", "evening"];
const APPOINTMENT_STATUSES = ["pending", "confirmed", "cancelled"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_RE = /^[0-9+\-()\s]{6,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function strField(value, fieldName, errors, opts) {
  const s = String(value == null ? "" : value).trim();
  if (!s) {
    if (opts.required) errors.push(fieldName + ": zorunlu.");
    return "";
  }
  if (opts.min && s.length < opts.min) errors.push(fieldName + ": en az " + opts.min + " karakter olmalı.");
  if (opts.max && s.length > opts.max) errors.push(fieldName + ": en fazla " + opts.max + " karakter olabilir.");
  return s;
}

// Bugünün tarihi "YYYY-MM-DD" olarak (UTC). Tarih karşılaştırması gün
// hassasiyetinde yapıldığı için metin karşılaştırması yeterlidir.
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// data: randevu formundan gelen ham obje. Döner: { errors: [...], value: temizlenmiş satır }
function validateAppointment(data) {
  const errors = [];
  if (!data || typeof data !== "object") return { errors: ["Geçersiz veri."], value: {} };

  const out = {};

  out.name = strField(data.name, "name", errors, { required: true, min: 2, max: 80 });

  const phone = strField(data.phone, "phone", errors, { required: true, max: 30 });
  if (phone && !PHONE_RE.test(phone)) errors.push("phone: geçerli bir telefon numarası girin.");
  out.phone = phone;

  const email = strField(data.email, "email", errors, { max: 120 });
  if (email && !EMAIL_RE.test(email)) errors.push("email: geçerli bir e-posta adresi girin.");
  out.email = email || null;

  const date = strField(data.preferred_date, "preferred_date", errors, { required: true });
  if (date) {
    if (!DATE_RE.test(date) || isNaN(Date.parse(date + "T00:00:00Z"))) {
      errors.push("preferred_date: geçerli bir tarih (YYYY-AA-GG) olmalı.");
    } else if (date < todayIso()) {
      errors.push("preferred_date: geçmiş bir tarih seçilemez.");
    }
  }
  out.preferred_date = date;

  const slot = String(data.time_slot || "").trim();
  if (TIME_SLOTS.indexOf(slot) === -1) errors.push("time_slot: morning | noon | evening olmalı.");
  out.time_slot = slot;

  out.note = strField(data.note, "note", errors, { max: 600 }) || null;

  const propertyId = String(data.property_id || "").trim();
  if (propertyId && !ID_RE.test(propertyId)) errors.push("property_id: geçersiz ilan id'si.");
  out.property_id = propertyId || null;

  out.property_title = strField(data.property_title, "property_title", errors, { max: 160 }) || null;

  const lang = String(data.lang || "tr").trim();
  out.lang = lang === "en" ? "en" : "tr";

  return { errors: errors, value: out };
}

// Bir ilanın "images" alanındaki her yolun kendi klasörüne ait
// göreceli bir repo yolu olduğunu doğrular (dış URL veya ".." ile
// klasör dışına çıkma girişimini reddeder).
function isOwnPropertyImagePath(id, path) {
  if (typeof path !== "string" || !path) return false;
  if (path.indexOf("..") !== -1) return false;
  const prefix = "assets/img/properties/" + id + "/";
  return path.startsWith(prefix) && path.length > prefix.length;
}

module.exports = {
  validateListing: validateListing,
  validateAppointment: validateAppointment,
  ID_RE: ID_RE,
  UUID_RE: UUID_RE,
  APPOINTMENT_STATUSES: APPOINTMENT_STATUSES,
  isOwnPropertyImagePath: isOwnPropertyImagePath,
};
