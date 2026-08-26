const { requireSession } = require("./_lib/auth");
const { getFile } = require("./_lib/github");
const { parsePropertiesFile } = require("./_lib/properties-store");

const PROPERTIES_PATH = "assets/js/properties.js";

module.exports = async function handler(req, res) {
  const session = requireSession(req, res);
  if (!session) return;

  try {
    const file = await getFile(PROPERTIES_PATH);
    if (!file) throw new Error("properties.js bulunamadı.");
    const parsed = parsePropertiesFile(file.content);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ items: parsed.items }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: String((err && err.message) || err) }));
  }
};
