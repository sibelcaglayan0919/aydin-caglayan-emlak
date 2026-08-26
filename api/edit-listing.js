const { requireSession } = require("./_lib/auth");
const { getFile, putFile } = require("./_lib/github");
const { parsePropertiesFile, serializeProperties } = require("./_lib/properties-store");
const { validateListing, isOwnPropertyImagePath } = require("./_lib/validate");

const PROPERTIES_PATH = "assets/js/properties.js";

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
  if (!id) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "id zorunlu." }));
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

    const { errors, value } = validateListing(data, null, { isEdit: true });
    if (errors.length > 0) {
      res.statusCode = 422;
      return res.end(JSON.stringify({ errors: errors }));
    }

    // Mevcut fotoğraflar + varsa yeni eklenenler (istemci /api/upload-photo ile
    // yükleyip yolları buraya "images" alanında tam liste olarak gönderir).
    const existing = parsed.items[idx];
    value.id = existing.id;
    if (Array.isArray(data.images) && data.images.length > 0) {
      const validImages = data.images.filter(function (p) { return isOwnPropertyImagePath(existing.id, p); });
      if (validImages.length !== data.images.length) {
        res.statusCode = 422;
        return res.end(JSON.stringify({ errors: ["images: yalnızca bu ilana ait assets/img/properties/" + existing.id + "/ altındaki yollar kabul edilir."] }));
      }
      value.images = validImages;
    } else {
      value.images = existing.images;
    }

    const newItems = parsed.items.slice();
    newItems[idx] = value;

    const newText = serializeProperties(newItems, parsed.header, parsed.footer);
    await putFile(PROPERTIES_PATH, newText, file.sha, "İlan güncellendi: " + id);

    res.end(JSON.stringify({ ok: true, id: id }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String((err && err.message) || err) }));
  }
};
