const { requireSession } = require("./_lib/auth");
const { getFile, putFile, deleteFile, listDirectory } = require("./_lib/github");
const { parsePropertiesFile, serializeProperties } = require("./_lib/properties-store");

const PROPERTIES_PATH = "assets/js/properties.js";
const ID_RE = /^[a-z0-9-]{3,60}$/;

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
  if (!ID_RE.test(id)) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "Geçersiz id." }));
  }

  try {
    const file = await getFile(PROPERTIES_PATH);
    if (!file) throw new Error("properties.js bulunamadı.");
    const parsed = parsePropertiesFile(file.content);

    const idx = parsed.items.findIndex(function (p) { return p.id === id; });
    if (idx === -1) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: "İlan bulunamadı: " + id }));
    }

    const newItems = parsed.items.slice();
    newItems.splice(idx, 1);
    const newText = serializeProperties(newItems, parsed.header, parsed.footer);
    await putFile(PROPERTIES_PATH, newText, file.sha, "İlan silindi: " + id);

    // Fotoğraf klasörünü de temizle (best-effort — biri başarısız olsa da devam eder)
    try {
      const files = await listDirectory("assets/img/properties/" + id);
      for (const f of files) {
        await deleteFile(f.path, f.sha, "İlan fotoğrafı silindi: " + f.path);
      }
    } catch (imgErr) {
      // İlan zaten silindi; fotoğraf temizliği başarısız olsa bile isteği başarılı say
      res.end(JSON.stringify({ ok: true, id: id, warning: "Fotoğraflar silinemedi: " + String(imgErr.message || imgErr) }));
      return;
    }

    res.end(JSON.stringify({ ok: true, id: id }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String((err && err.message) || err) }));
  }
};
