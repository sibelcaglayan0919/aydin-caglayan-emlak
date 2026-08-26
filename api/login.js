const { verifyCredentials, setSessionCookie } = require("./_lib/auth");
const { checkRateLimit } = require("./_lib/rate-limit");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  if (!checkRateLimit(req, "login")) {
    res.statusCode = 429;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: "Çok fazla deneme yapıldı, lütfen biraz sonra tekrar deneyin." }));
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

  const ok = await verifyCredentials(data.username, data.password);
  if (!ok) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: "Kullanıcı adı veya şifre hatalı." }));
  }

  try {
    setSessionCookie(res, data.username);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: "Sunucu yapılandırma hatası: " + String((e && e.message) || e) }));
  }
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: true }));
};
