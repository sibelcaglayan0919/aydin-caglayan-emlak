const { requireSession } = require("./_lib/auth");
const { uploadOnePhoto } = require("./_lib/images");

module.exports = async function handler(req, res) {
  const session = requireSession(req, res);
  if (!session) return;
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  let body = "";
  await new Promise(function (resolve) {
    req.on("data", function (chunk) { body += chunk; });
    req.on("end", resolve);
  });

  let data;
  try {
    data = JSON.parse(body || "{}");
  } catch (e) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: "Geçersiz istek." }));
  }

  try {
    const path = await uploadOnePhoto(data.id, data.index, data.dataUrl);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true, path: path }));
  } catch (err) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: String((err && err.message) || err) }));
  }
};
