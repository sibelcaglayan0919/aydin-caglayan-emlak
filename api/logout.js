const { clearSessionCookie } = require("./_lib/auth");

module.exports = async function handler(req, res) {
  clearSessionCookie(res);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: true }));
};
