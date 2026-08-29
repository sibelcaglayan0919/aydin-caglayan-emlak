const { requireSession } = require("./_lib/auth");
const { sbUpdate } = require("./_lib/supabase");
const { UUID_RE, APPOINTMENT_STATUSES } = require("./_lib/validate");

async function readBody(req) {
  let body = "";
  await new Promise(function (resolve) {
    req.on("data", function (chunk) { body += chunk; });
    req.on("end", resolve);
  });
  return body;
}

module.exports = async function handler(req, res) {
  const session = requireSession(req, res);
  if (!session) return;
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  res.setHeader("Content-Type", "application/json");

  let data;
  try {
    data = JSON.parse((await readBody(req)) || "{}");
  } catch (e) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "Geçersiz istek." }));
  }

  const id = String(data.id || "").trim();
  const status = String(data.status || "").trim();
  if (!UUID_RE.test(id)) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "Geçersiz randevu id'si." }));
  }
  if (APPOINTMENT_STATUSES.indexOf(status) === -1) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "Geçersiz durum." }));
  }

  try {
    const row = await sbUpdate("appointments", id, { status: status });
    if (!row) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: "Randevu bulunamadı." }));
    }
    res.end(JSON.stringify({ ok: true, id: id, status: status }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String((err && err.message) || err) }));
  }
};
