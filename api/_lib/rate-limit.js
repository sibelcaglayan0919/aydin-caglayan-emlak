/* ============================================================
   rate-limit.js — basit, bağımlılıksız IP başına hız sınırlama.
   Bellek içi (in-memory) tutulur; serverless fonksiyon soğuk
   başladığında sıfırlanır. Tek başına yeterli bir savunma değildir
   ama brute-force denemesinin maliyetini belirgin şekilde artırır.
   ============================================================ */

const buckets = new Map();
const WINDOW_MS = 60 * 1000; // 1 dakika
const MAX_ATTEMPTS = 5;

function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

// true dönerse istek limit içinde, işleme devam edilebilir.
// false dönerse limit aşılmış, istek reddedilmeli.
function checkRateLimit(req, key) {
  const ip = getClientIp(req);
  const bucketKey = (key || "default") + ":" + ip;
  const now = Date.now();
  const entry = buckets.get(bucketKey);

  if (!entry || now - entry.start > WINDOW_MS) {
    buckets.set(bucketKey, { start: now, count: 1 });
    return true;
  }

  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) return false;
  return true;
}

module.exports = { checkRateLimit: checkRateLimit };
