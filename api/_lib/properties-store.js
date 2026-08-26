/* ============================================================
   properties-store.js — assets/js/properties.js dosyasını
   Node'un yerleşik `vm` modülüyle okuyup yazan yardımcılar.
   Regex ile metin kırpma YOK — dosya, kendi PROPERTIES dizisi
   olarak parse edilir, düzenlenir, aynı stille yeniden üretilir.

   Güvenlik notu: `vm` burada bir güvenlik sandbox'ı DEĞİLDİR —
   Node'un resmi dokümantasyonu da vm modülünü güvenilmeyen kod
   çalıştırmak için güvenli kabul etmez. Bu dosyanın çalıştırdığı
   içerik (properties.js), yalnızca bu repodaki GitHub Contents
   API'sinden — yani zaten kimlik doğrulamalı /api/add-listing ve
   /api/edit-listing uç noktalarınca üretilmiş, güvenilir kabul
   edilen — bir dosyadır. Girdi güvenilir olduğu için vm burada
   güvenlidir; dışarıdan gelen keyfi bir metin asla buraya
   verilmemelidir.
   ============================================================ */

const vm = require("vm");

const START_MARKER = "const PROPERTIES = [";
const FOOTER_MARKER = "\n\n  // Yeni ilan örneği:";

// Dosya metnini { header, items, footer } olarak ayırır.
// header: "const PROPERTIES = [" öncesindeki her şey (aynen korunur)
// items: gerçek ilan objeleri dizisi (JS objesi olarak, vm ile elde edilir)
// footer: "// Yeni ilan örneği:" yorumundan dosya sonuna kadar olan kısım (aynen korunur)
function parsePropertiesFile(fileText) {
  const startIdx = fileText.indexOf(START_MARKER);
  if (startIdx === -1) {
    throw new Error("properties.js içinde 'const PROPERTIES = [' bulunamadı.");
  }
  const header = fileText.slice(0, startIdx);

  const footerIdx = fileText.indexOf(FOOTER_MARKER);
  const footer = footerIdx !== -1 ? fileText.slice(footerIdx) : "\n];\n";

  const sandbox = {};
  vm.createContext(sandbox);
  // Yukarıdaki güvenlik notuna bakın: burada çalıştırılan metin
  // yalnızca GitHub'daki kendi properties.js dosyamızdır.
  vm.runInContext(fileText, sandbox, { timeout: 2000 });

  if (!Array.isArray(sandbox.PROPERTIES)) {
    throw new Error("properties.js parse edildi ama PROPERTIES bir dizi değil.");
  }

  return { header: header, items: sandbox.PROPERTIES, footer: footer };
}

// ---- Serileştirme (obje -> properties.js metni) ----

const CANONICAL_KEYS = [
  "id", "title", "desc", "price", "currency", "status", "type",
  "location", "beds", "baths", "area", "featured", "images",
  "details", "tour",
];

const INLINE_COMMENTS = {
  status: "// sale | rent | sold",
  type: "// villa | daire | arsa | isyeri",
};

function str(v) {
  return JSON.stringify(v);
}

function serializeTrEn(obj, indent) {
  // { tr: "...", en: "..." } — kısa ise tek satır, uzunsa çok satır
  const trStr = str(obj.tr);
  const enStr = str(obj.en);
  if (trStr.length + enStr.length <= 70) {
    return "{ tr: " + trStr + ", en: " + enStr + " }";
  }
  const inner = indent + "  ";
  return "{\n" + inner + "tr: " + trStr + ",\n" + inner + "en: " + enStr + "\n" + indent + "}";
}

function serializeStringArray(arr, indent) {
  if (!arr || arr.length === 0) return "[]";
  const inner = indent + "  ";
  return "[\n" + arr.map(function (v) { return inner + str(v); }).join(",\n") + "\n" + indent + "]";
}

function serializePlainObject(obj, indent) {
  const keys = Object.keys(obj);
  if (keys.length === 0) return "{}";
  const inner = indent + "  ";
  const lines = keys.map(function (k) {
    return inner + k + ": " + serializeGeneric(obj[k], inner);
  });
  return "{\n" + lines.join(",\n") + "\n" + indent + "}";
}

function serializeGeneric(value, indent) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "string") return str(value);
  if (Array.isArray(value)) return serializeStringArray(value, indent);
  if (typeof value === "object") return serializePlainObject(value, indent);
  return "null";
}

// Tek bir ilan objesini "  { ... }" biçiminde, mevcut dosya stiliyle üretir.
function serializeItem(item) {
  const lines = [];
  const seen = {};

  CANONICAL_KEYS.forEach(function (key) {
    if (!(key in item)) return;
    seen[key] = true;
    const value = item[key];
    let line;
    if (key === "title" || key === "location") {
      line = "    " + key + ": " + serializeTrEn(value, "    ");
    } else if (key === "desc") {
      line = "    desc: {\n      tr: " + str(value.tr) + ",\n      en: " + str(value.en) + "\n    }";
    } else if (key === "images") {
      line = "    images: " + serializeStringArray(value, "    ");
    } else if (key === "details" || key === "tour") {
      line = "    " + key + ": " + serializeGeneric(value, "    ");
    } else if (typeof value === "string") {
      line = "    " + key + ": " + str(value);
    } else {
      line = "    " + key + ": " + serializeGeneric(value, "    ");
    }
    if (INLINE_COMMENTS[key]) {
      line = line + "  " + INLINE_COMMENTS[key];
    }
    lines.push(line);
  });

  // Beklenmeyen ekstra alanlar varsa (ileride şema genişlerse) sona ekle
  Object.keys(item).forEach(function (key) {
    if (seen[key]) return;
    lines.push("    " + key + ": " + serializeGeneric(item[key], "    "));
  });

  // status/type dışındaki satırlara virgül ekle (INLINE_COMMENTS'li satırlarda virgül comment'ten önce eklenmeli)
  const withCommas = lines.map(function (line, i) {
    const isLast = i === lines.length - 1;
    if (isLast) return line;
    const commentIdx = line.indexOf("  //");
    if (commentIdx !== -1) {
      return line.slice(0, commentIdx) + "," + line.slice(commentIdx);
    }
    return line + ",";
  });

  return "  {\n" + withCommas.join("\n") + "\n  }";
}

function serializeProperties(items, header, footer) {
  const body = items.map(serializeItem).join(",\n\n");
  return header + START_MARKER + "\n" + body + footer;
}

module.exports = {
  parsePropertiesFile: parsePropertiesFile,
  serializeItem: serializeItem,
  serializeProperties: serializeProperties,
};
