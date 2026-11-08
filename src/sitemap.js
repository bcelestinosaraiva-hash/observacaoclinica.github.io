const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { notifyIndexNow } = require("./indexnow"); // notifica o IndexNow sobre URLs novas/alteradas

const baseUrl = "https://observacaoclinica.com";
const baseHost = new URL(baseUrl).hostname;
const contentDir = path.join(__dirname, "../");
const sitemapPath = path.join(contentDir, "sitemap.xml");

// Pastas/ficheiros ignorados pelo nome
const IGNORED_NAMES = new Set([
  "node_modules",
  "src",
  "recente",
  "recentes",
  "sitemap.xml",
  "404.html"
]);

// Rotas ignoradas pelo caminho completo (ex.: "/br/recente")
const IGNORED_ROUTES = ["/recente", "/recentes", "/br/recente", "/br/recentes"];

// Ficheiros de verificação (Yandex, Google, Bing...) que não são páginas
function isVerificationFile(file) {
  return (
    /^yandex_[a-z0-9]+\.html$/i.test(file) ||
    /^google[a-z0-9]+\.html$/i.test(file) ||
    /^BingSiteAuth\.xml$/i.test(file)
  );
}

function isIgnoredRoute(route) {
  return IGNORED_ROUTES.some(r => route === r || route.startsWith(r + "/"));
}

// ---------- Datas ----------

// Converte qualquer data válida para YYYY-MM-DD (ou null se inválida)
function toYmd(value) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}

// Data do último commit que mexeu no ficheiro (funciona se o repositório
// tiver histórico completo; em clones "shallow" devolve null)
function getGitDate(fullPath) {
  try {
    const out = execSync(`git log -1 --format=%cI -- "${fullPath}"`, {
      cwd: contentDir,
      stdio: ["ignore", "pipe", "ignore"]
    })
      .toString()
      .trim();
    return toYmd(out);
  } catch (e) {
    return null;
  }
}

// Prioridade da data de modificação:
// 1) JSON-LD "dateModified"
// 2) <meta property="article:modified_time">
// 3) data do último commit no Git
// 4) data do ficheiro (mtime) - último recurso, muda a cada deploy/clone
function getLastmod(html, fullPath, stat) {
  const ld = getJsonLdObjects(html);
  for (const obj of ld) {
    const d = toYmd(obj.dateModified);
    if (d) return d;
  }

  const metaMatch = html.match(
    /<meta[^>]*property=["']article:modified_time["'][^>]*content=["']([^"']+)["']/i
  );
  if (metaMatch) {
    const d = toYmd(metaMatch[1]);
    if (d) return d;
  }

  const gitDate = getGitDate(fullPath);
  if (gitDate) return gitDate;

  return toYmd(stat.mtime);
}

// ---------- HTML helpers ----------

// Devolve todos os objetos JSON-LD da página (suporta arrays e @graph)
function getJsonLdObjects(html) {
  const objects = [];
  const blocks =
    html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ) || [];

  for (const block of blocks) {
    const jsonText = block
      .replace(/<script[^>]*>/i, "")
      .replace(/<\/script>/i, "");
    try {
      const data = JSON.parse(jsonText);
      const list = Array.isArray(data) ? data : [data];
      for (const item of list) {
        if (item && Array.isArray(item["@graph"])) {
          objects.push(...item["@graph"]);
        } else if (item) {
          objects.push(item);
        }
      }
    } catch (e) {
      // JSON-LD mal formado nesta página; ignora
    }
  }
  return objects;
}

// Páginas com noindex não devem estar no sitemap
function hasNoindex(html) {
  return /<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
}

// Se o canonical apontar para outra URL, a página não deve estar no sitemap
function getCanonical(html) {
  const m = html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i);
  if (!m) return null;
  const href = m[0].match(/href=["']([^"']+)["']/i);
  return href ? href[1] : null;
}

// Extrai APENAS a imagem principal da página:
// 1) JSON-LD "image"  2) og:image  3) twitter:image
function getImagesFromHtml(html) {
  let src = null;

  for (const obj of getJsonLdObjects(html)) {
    let img = obj.image;
    if (Array.isArray(img)) img = img[0];
    if (img) {
      if (typeof img === "string") src = img;
      else if (typeof img === "object" && img.url) src = img.url;
    }
    if (src) break;
  }

  if (!src) {
    const og = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
    );
    if (og) src = og[1];
  }

  if (!src) {
    const tw = html.match(
      /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i
    );
    if (tw) src = tw[1];
  }

  if (!src) return [];

  // Normalizar para URL absoluta
  if (!/^https?:\/\//i.test(src)) {
    src = src.startsWith("/") ? src : "/" + src;
    src = baseUrl + src;
  }

  // Ignorar imagens de outros domínios (compara o host, não texto solto)
  try {
    if (new URL(src).hostname !== baseHost) return [];
  } catch (e) {
    return [];
  }

  // Só <image:loc>. O Google descontinuou <image:title> e <image:caption>.
  return [{ loc: src }];
}

// Extrai <link rel="alternate" hreflang="..." href="...">
function getHreflangFromHtml(html) {
  const links = [];
  const tags = html.match(/<link[^>]*rel=["']alternate["'][^>]*>/gi) || [];

  tags.forEach(tag => {
    const hreflangMatch = tag.match(/hreflang=["']([^"']+)["']/i);
    const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
    if (hreflangMatch && hrefMatch) {
      links.push({ hreflang: hreflangMatch[1], href: hrefMatch[1] });
    }
  });

  return links;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ---------- Varrer o site ----------

function getUrls(dir, route = "") {
  let urls = [];
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (
      file.startsWith(".") ||
      IGNORED_NAMES.has(file) ||
      isVerificationFile(file)
    ) {
      return;
    }

    if (stat.isDirectory()) {
      const childRoute = route + "/" + file;
      if (isIgnoredRoute(childRoute)) return;
      urls = urls.concat(getUrls(fullPath, childRoute));
      return;
    }

    if (!file.endsWith(".html")) return;

    let url = route + "/" + file;
    url = url.replace(/\/index\.html$/, "/"); // index.html -> /
    url = url.replace(/\.html$/, "");         // remove .html
    url = url.replace(/\/+/g, "/");           // barras duplicadas
    if (url !== "/" && !url.endsWith("/")) url += "/";

    const html = fs.readFileSync(fullPath, "utf8");

    // Fora do sitemap: páginas noindex
    if (hasNoindex(html)) return;

    // Fora do sitemap: páginas cujo canonical aponta para outra URL
    const canonical = getCanonical(html);
    if (canonical) {
      const normalize = u => u.replace(/\/+$/, "");
      const self = normalize(baseUrl + url);
      if (normalize(canonical) !== self) return;
    }

    urls.push({
      url,
      lastmod: getLastmod(html, fullPath, stat),
      images: getImagesFromHtml(html),
      hreflangs: getHreflangFromHtml(html)
    });
  });

  return urls;
}

// ---------- Sitemap anterior (para detetar mudanças) ----------

function getPreviousUrlMap() {
  const map = new Map();
  if (!fs.existsSync(sitemapPath)) return map;

  const oldXml = fs.readFileSync(sitemapPath, "utf8");
  const blocks = oldXml.match(/<url>[\s\S]*?<\/url>/g) || [];

  blocks.forEach(block => {
    const locMatch = block.match(/<loc>([^<]+)<\/loc>/);
    const lastmodMatch = block.match(/<lastmod>([^<]+)<\/lastmod>/);
    if (locMatch) map.set(locMatch[1], lastmodMatch ? lastmodMatch[1] : null);
  });

  return map;
}

const previousUrls = getPreviousUrlMap();
const isFirstRun = previousUrls.size === 0;

let urls = getUrls(contentDir);

// Remover duplicados e ordenar para o ficheiro ser estável entre execuções
urls = Array.from(new Map(urls.map(item => [item.url, item])).values()).sort(
  (a, b) => a.url.localeCompare(b.url)
);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
    .map(
      page => `  <url>
    <loc>${escapeXml(baseUrl + page.url)}</loc>${page.lastmod
          ? `
    <lastmod>${page.lastmod}</lastmod>`
          : ""
        }${page.hreflangs
          .map(
            h => `
    <xhtml:link rel="alternate" hreflang="${escapeXml(h.hreflang)}" href="${escapeXml(h.href)}"/>`
          )
          .join("")}${page.images
            .map(
              img => `
    <image:image>
      <image:loc>${escapeXml(img.loc)}</image:loc>
    </image:image>`
            )
            .join("")}
  </url>`
    )
    .join("\n")}
</urlset>
`;

fs.writeFileSync(sitemapPath, sitemap, "utf8");

const totalImages = urls.reduce((sum, p) => sum + p.images.length, 0);
const totalHreflangs = urls.reduce((sum, p) => sum + p.hreflangs.length, 0);
const semData = urls.filter(p => !p.lastmod).length;

console.log(
  `✔ Sitemap atualizado com ${urls.length} URLs, ${totalImages} imagens e ${totalHreflangs} tags hreflang.`
);
if (semData > 0) {
  console.log(`⚠ ${semData} URL(s) sem data de modificação válida.`);
}

// ---------- IndexNow ----------

const changedUrls = urls
  .filter(page => {
    const previousLastmod = previousUrls.get(baseUrl + page.url);
    return previousLastmod === undefined || previousLastmod !== page.lastmod;
  })
  .map(page => baseUrl + page.url);

if (isFirstRun) {
  console.log("→ Primeira execução (sem sitemap anterior), IndexNow não foi notificado.");
} else if (changedUrls.length > 0) {
  console.log(`→ ${changedUrls.length} URL(s) nova(s)/atualizada(s), notificando o IndexNow...`);
  notifyIndexNow(changedUrls);
} else {
  console.log("→ Nenhuma URL nova ou alterada, IndexNow não foi notificado.");
}
// CODE PRA RODAR: node src/sitemap.js