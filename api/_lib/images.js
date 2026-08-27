/* ============================================================
   images.js — tek bir fotoğrafı assets/img/properties/<id>/N.jpg
   olarak GitHub'a yükler. İstemci tarafında zaten küçültülmüş/
   sıkıştırılmış olmalı (bkz. admin/admin.js resizeImage()).
   ============================================================ */

const { putFile, getFile } = require("./github");

const MAX_DATAURL_LEN = 2 * 1024 * 1024; // ~2MB base64 metin uzunluğu (güvenlik sınırı)
const ID_RE = /^[a-z0-9-]{3,60}$/;

async function uploadOnePhoto(id, index, dataUrl) {
  if (!ID_RE.test(id)) throw new Error("Geçersiz ilan id.");
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
    throw new Error("Geçersiz fotoğraf verisi.");
  }
  if (dataUrl.length > MAX_DATAURL_LEN) {
    throw new Error("Fotoğraf çok büyük, tarayıcıda küçültme başarısız olmuş olabilir.");
  }
  const n = Math.max(1, Math.round(Number(index) || 1));
  const commaIdx = dataUrl.indexOf(",");
  const base64 = dataUrl.slice(commaIdx + 1);
  const buffer = Buffer.from(base64, "base64");
  const path = "assets/img/properties/" + id + "/" + n + ".jpg";
  // Aynı path'te (aynı index) zaten bir fotoğraf olabilir (düzenleme sırasında
  // üstüne yazma durumu) — GitHub'ın var olan dosyanın üstüne yazması için
  // mevcut sha'sını göndermemiz gerekiyor, yoksa 422 "sha wasn't supplied" hatası döner.
  const existing = await getFile(path);
  await putFile(path, buffer, existing ? existing.sha : null, "İlan fotoğrafı eklendi: " + id + "/" + n + ".jpg");
  return path;
}

module.exports = { uploadOnePhoto: uploadOnePhoto };
