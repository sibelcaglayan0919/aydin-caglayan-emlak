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

  try {
    const file = await getFile(PROPERTIES_PATH);
    if (!file) throw new Error("properties.js bulunamadı.");
    const parsed = parsePropertiesFile(file.content);
    const existingIds = parsed.items.map(function (p) { return p.id; });

    const { errors, value } = validateListing(data, existingIds, { isEdit: false });
    if (!Array.isArray(data.images) || data.images.length === 0) {
      errors.push("images: en az 1 fotoğraf gerekli.");
    } else {
      const validImages = data.images.filter(function (p) { return isOwnPropertyImagePath(value.id, p); });
      if (validImages.length !== data.images.length) {
        errors.push("images: yalnızca bu ilana ait assets/img/properties/" + value.id + "/ altındaki yollar kabul edilir.");
      }
      value.images = validImages;
    }
    if (errors.length > 0) {
      res.statusCode = 422;
      return res.end(JSON.stringify({ errors: errors }));
    }

    const newItems = parsed.items.concat([value]);
    const newText = serializeProperties(newItems, parsed.header, parsed.footer);
    await putFile(PROPERTIES_PATH, newText, file.sha, "Yeni ilan eklendi: " + value.id);

    res.end(JSON.stringify({ ok: true, id: value.id }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String((err && err.message) || err) }));
  }
};
