/* ============================================================
   book-appointment.js — PUBLIC uç: ziyaretçi randevu talebi bırakır.
   Oturum GEREKTİRMEZ. Savunma: honeypot + IP başına hız sınırı +
   katı alan doğrulaması.
   ============================================================ */

const { checkRateLimit } = require("./_lib/rate-limit");
const { sbInsert } = require("./_lib/supabase");
const { validateAppointment } = require("./_lib/validate");

async function readBody(req) {
  let body = "";
  await new Promise(function (resolve) {
    req.on("data", function (chunk) { body += chunk; });
    req.on("end", resolve);
  });
  return body;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  res.setHeader("Content-Type", "application/json");

  if (!checkRateLimit(req, "book")) {
    res.statusCode = 429;
    return res.end(JSON.stringify({ error: "Çok fazla talep gönderildi, lütfen biraz sonra tekrar deneyin." }));
  }

  let data;
  try {
    data = JSON.parse((await readBody(req)) || "{}");
  } catch (e) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "Geçersiz istek." }));
  }

  // Honeypot: gerçek ziyaretçi bu gizli alanı görmez, botlar doldurur.
  // Kaydı sessizce yut — bot bir hata görmesin ki tekrar denemesin.
  if (String(data.company || "").trim() !== "") {
    return res.end(JSON.stringify({ ok: true }));
  }

  const { errors, value } = validateAppointment(data);
  if (errors.length > 0) {
    res.statusCode = 422;
    return res.end(JSON.stringify({ errors: errors }));
  }

  try {
    await sbInsert("appointments", Object.assign({}, value, { status: "pending" }));
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String((err && err.message) || err) }));
  }
};
