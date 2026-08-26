const { getSession } = require("./_lib/auth");

module.exports = async function handler(req, res) {
  const session = getSession(req);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ loggedIn: !!session, username: session ? session.username : null }));
};
