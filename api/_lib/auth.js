/* ============================================================
   auth.js — Danışman girişi: şifre doğrulama + imzalı oturum çerezi
   Bağımlılık yok, yalnızca Node'un yerleşik `crypto` modülü kullanılır.
   ============================================================ */

const crypto = require("crypto");

const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 saat

function timingSafeEqualHex(a, b) {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function verifyCredentials(username, password) {
  const expectedUser = process.env.ADMIN_USERNAME || "";
  const salt = process.env.ADMIN_PASSWORD_SALT || "";
  const expectedHash = process.env.ADMIN_PASSWORD_HASH || "";
  if (!expectedUser || !salt || !expectedHash) return false;
  if (typeof username !== "string" || typeof password !== "string") return false;

  const userBuf = Buffer.from(username);
  const expectedUserBuf = Buffer.from(expectedUser);
  const userOk =
    userBuf.length === expectedUserBuf.length &&
    crypto.timingSafeEqual(userBuf, expectedUserBuf);

  // scrypt event loop'u bloklamasın diye async (callback tabanlı) hali kullanılır
  const gotHashBuf = await new Promise(function (resolve, reject) {
    crypto.scrypt(password, salt, 64, function (err, derivedKey) {
      if (err) return reject(err);
      resolve(derivedKey);
    });
  });
  const gotHash = gotHashBuf.toString("hex");
  const passOk = timingSafeEqualHex(gotHash, expectedHash);

  return userOk && passOk;
}

function sign(payload) {
  const secret = process.env.SESSION_SECRET || "";
  if (secret.length < 32) {
    // Boş/zayıf anahtarla oturum imzalamak, token'ların taklit edilebilmesi
    // anlamına gelir — sessizce devam etmek yerine burada durdur.
    throw new Error("SESSION_SECRET eksik veya çok kısa (en az 32 karakter olmalı).");
  }
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function createSessionToken(username) {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = username + "." + expires;
  const sig = sign(payload);
  return Buffer.from(payload + "." + sig).toString("base64url");
}

function verifySessionToken(token) {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(".");
    // Kullanıcı adının içinde "." geçebilir (örn. "aydin.caglayan"); bu yüzden
    // baştan 3 parça beklemek yerine son iki parçayı (zamanaşımı, imza) al,
    // geri kalan her şeyi (nokta dahil) kullanıcı adı olarak birleştir.
    if (parts.length < 3) return null;
    const sig = parts[parts.length - 1];
    const expiresStr = parts[parts.length - 2];
    const username = parts.slice(0, parts.length - 2).join(".");
    const payload = username + "." + expiresStr;
    const expectedSig = sign(payload);
    if (!timingSafeEqualHex(sig, expectedSig)) return null;
    const expires = parseInt(expiresStr, 10);
    if (!expires || Date.now() > expires) return null;
    return { username: username };
  } catch (e) {
    return null;
  }
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  header.split(";").forEach(function (part) {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(val);
  });
  return out;
}

function getSession(req) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifySessionToken(token);
}

function setSessionCookie(res, username) {
  const token = createSessionToken(username);
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  res.setHeader(
    "Set-Cookie",
    COOKIE_NAME + "=" + token + "; Max-Age=" + maxAge + "; Path=/; HttpOnly; Secure; SameSite=Strict"
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    COOKIE_NAME + "=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict"
  );
}

function requireSession(req, res) {
  const session = getSession(req);
  if (!session) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Oturum geçersiz, lütfen tekrar giriş yapın." }));
    return null;
  }
  return session;
}

module.exports = {
  verifyCredentials: verifyCredentials,
  getSession: getSession,
  setSessionCookie: setSessionCookie,
  clearSessionCookie: clearSessionCookie,
  requireSession: requireSession,
};
