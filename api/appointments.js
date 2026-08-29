const { requireSession } = require("./_lib/auth");
const { sbSelect } = require("./_lib/supabase");

module.exports = async function handler(req, res) {
  const session = requireSession(req, res);
  if (!session) return;

  res.setHeader("Content-Type", "application/json");

  try {
    const items = await sbSelect("appointments", "select=*&order=created_at.desc");
    res.end(JSON.stringify({ items: items }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String((err && err.message) || err) }));
  }
};
