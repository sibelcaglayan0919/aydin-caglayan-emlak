/* ============================================================
   github.js — GitHub Contents API sarmalayıcı
   Sadece Node'un yerleşik `fetch`ini kullanır (Node 18+, Vercel'de var).
   ============================================================ */

const API_BASE = "https://api.github.com";

function repoInfo() {
  const repo = process.env.GITHUB_REPO || "";
  const branch = process.env.GITHUB_BRANCH || "master";
  const token = process.env.GITHUB_TOKEN || "";
  if (!repo || !token) {
    throw new Error("GITHUB_REPO veya GITHUB_TOKEN ortam değişkeni eksik.");
  }
  return { repo: repo, branch: branch, token: token };
}

function headers(token) {
  return {
    Authorization: "Bearer " + token,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "aydin-caglayan-emlak-admin",
  };
}

// path içeriğini + sha'sını döner. Dosya yoksa null döner.
async function getFile(path) {
  const { repo, branch, token } = repoInfo();
  const url = API_BASE + "/repos/" + repo + "/contents/" + encodeURI(path) + "?ref=" + branch;
  const res = await fetch(url, { headers: headers(token) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("GitHub okuma hatası (" + res.status + "): " + (await res.text()));
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf8");
  return { content: content, sha: data.sha };
}

// contentText: düz metin (UTF-8) ya da Buffer olabilir. sha varsa güncelleme, yoksa yeni dosya.
async function putFile(path, content, sha, message) {
  const { repo, branch, token } = repoInfo();
  const url = API_BASE + "/repos/" + repo + "/contents/" + encodeURI(path);
  const contentBase64 = Buffer.isBuffer(content)
    ? content.toString("base64")
    : Buffer.from(content, "utf8").toString("base64");
  const body = {
    message: message,
    content: contentBase64,
    branch: branch,
  };
  if (sha) body.sha = sha;
  const res = await fetch(url, {
    method: "PUT",
    headers: Object.assign({ "Content-Type": "application/json" }, headers(token)),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("GitHub yazma hatası (" + res.status + "): " + (await res.text()));
  return res.json();
}

// path bir klasörse dosya listesini ([{ path, sha }, ...]) döner. Yoksa [] döner.
async function listDirectory(path) {
  const { repo, branch, token } = repoInfo();
  const url = API_BASE + "/repos/" + repo + "/contents/" + encodeURI(path) + "?ref=" + branch;
  const res = await fetch(url, { headers: headers(token) });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error("GitHub klasör okuma hatası (" + res.status + "): " + (await res.text()));
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data
    .filter(function (entry) { return entry.type === "file"; })
    .map(function (entry) { return { path: entry.path, sha: entry.sha }; });
}

async function deleteFile(path, sha, message) {
  const { repo, branch, token } = repoInfo();
  const url = API_BASE + "/repos/" + repo + "/contents/" + encodeURI(path);
  const res = await fetch(url, {
    method: "DELETE",
    headers: Object.assign({ "Content-Type": "application/json" }, headers(token)),
    body: JSON.stringify({ message: message, sha: sha, branch: branch }),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error("GitHub silme hatası (" + res.status + "): " + (await res.text()));
  }
}

module.exports = { getFile: getFile, putFile: putFile, deleteFile: deleteFile, listDirectory: listDirectory };
