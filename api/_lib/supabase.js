/* ============================================================
   supabase.js — Supabase PostgREST sarmalayıcı
   Sadece Node'un yerleşik `fetch`ini kullanır (Node 18+, Vercel'de var).

   Güvenlik notu: burada kullanılan anahtar `service_role`dur ve RLS'i
   bypass eder — bu dosya YALNIZCA sunucu tarafında (api/) çalışır,
   anahtar hiçbir zaman tarayıcıya gönderilmez. `appointments` tablosunda
   RLS açık ama hiçbir policy yok; yani anon/publishable anahtarla
   dışarıdan erişim tamamen kapalıdır.
   ============================================================ */

function config() {
  const url = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) {
    throw new Error("SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY ortam değişkeni eksik.");
  }
  return { url: url, key: key };
}

function headers(key, extra) {
  return Object.assign(
    {
      apikey: key,
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    extra || {}
  );
}

// method: GET | POST | PATCH ...  path: "appointments"  query: "order=created_at.desc"
async function sbRequest(method, path, opts) {
  opts = opts || {};
  const { url, key } = config();
  const full = url + "/rest/v1/" + path + (opts.query ? "?" + opts.query : "");
  const res = await fetch(full, {
    method: method,
    headers: headers(key, opts.headers),
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    throw new Error("Supabase hatası (" + res.status + "): " + (await res.text()));
  }
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

async function sbInsert(table, row) {
  const rows = await sbRequest("POST", table, {
    body: [row],
    headers: { Prefer: "return=representation" },
  });
  return Array.isArray(rows) ? rows[0] : null;
}

async function sbSelect(table, query) {
  const rows = await sbRequest("GET", table, { query: query });
  return Array.isArray(rows) ? rows : [];
}

async function sbUpdate(table, id, patch) {
  const rows = await sbRequest("PATCH", table, {
    query: "id=eq." + encodeURIComponent(id),
    body: patch,
    headers: { Prefer: "return=representation" },
  });
  return Array.isArray(rows) ? rows[0] : null;
}

module.exports = {
  sbRequest: sbRequest,
  sbInsert: sbInsert,
  sbSelect: sbSelect,
  sbUpdate: sbUpdate,
};
