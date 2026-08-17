const fs = require("fs");
const path = require("path");
const { notifyIndexNow } = require("./indexnow"); // <-- novo: importa o módulo IndexNow

const baseUrl = "https://observacaoclinica.com";
const contentDir = path.join(__dirname, "../");
const sitemapPath = path.join(contentDir, "sitemap.xml");

function getUrls(dir, route = "") {
  let urls = [];

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    // Pastas e ficheiros a ignorar
    if (
      file === "node_modules" ||
      file === ".git" ||
      file === "src" ||
      file === "yandex_b5d9e3c953a4c1e6.html" ||
      file === "recentes" ||
      file === "/yandex_b5d9e3c953a4c1e6/" ||
      file === "sitemap.xml" ||
      file === "src" ||

      file.startsWith(".")
    ) {
      return;
    }

    https://observacaoclinica.com/yandex_b5d9e3c953a4c1e6/

    if (stat.isDirectory()) {
      urls = urls.concat(getUrls(fullPath, route + "/" + file));
    } else if (file.endsWith(".html")) {

      let url = route + "/" + file;

      // Converter index.html em /
      url = url.replace("/index.html", "/");

      // Remover .html
      url = url.replace(".html", "");

      // Corrigir barras duplicadas
      url = url.replace(/\/+/g, "/");

      // Garantir barra final, exceto na raiz
      if (url !== "/" && !url.endsWith("/")) {
        url += "/";
      }
      // Prioridades
      let priority = "0.7";

      if (url === "/") {
        priority = "1.0";
      } else if (url.split("/").filter(Boolean).length === 1) {
        // categorias: /nutricao, /saude-az, etc.
        priority = "0.8";
      }

      // Extrair imagens do HTML desta página
      const images = getImagesFromHtml(fullPath, url);

      urls.push({
        url,
        lastmod: stat.mtime.toISOString().split("T")[0],
        priority,
        images
      });
    }
  });

  return urls;
}

// Extrai APENAS a imagem oficial/principal da página (uma só por página),
// lendo por ordem de prioridade:
// 1) JSON-LD (schema.org) -> campo "image"
// 2) <meta property="og:image">
// 3) <meta name="twitter:image">
// Isto evita capturar imagens da sidebar "relacionados", logo, foto de autor, etc.,
// porque usa a imagem que o próprio site já define como "capa" da página.
function getImagesFromHtml(filePath, pageUrl) {
  const html = fs.readFileSync(filePath, "utf8");

  let src = null;
  let title = null;

  // 1) Tentar extrair do JSON-LD
  const ldJsonMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];

  for (const block of ldJsonMatches) {
    const jsonText = block.replace(/<script[^>]*>/i, "").replace(/<\/script>/i, "");
    try {
      const data = JSON.parse(jsonText);
      const imageField = data.image;

      if (imageField) {
        if (typeof imageField === "string") {
          src = imageField;
        } else if (typeof imageField === "object" && imageField.url) {
          src = imageField.url;
        }
      }

      if (!title && data.headline) {
        title = data.headline;
      }

      if (src) break; // já encontrámos, não precisamos de continuar
    } catch (e) {
      // JSON-LD mal formado nesta página; ignora e tenta o próximo bloco/fallback
    }
  }

  // 2) Fallback: og:image
  if (!src) {
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogMatch) src = ogMatch[1];
  }

  // 3) Fallback: twitter:image
  if (!src) {
    const twMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
    if (twMatch) src = twMatch[1];
  }

  // Fallback do título: og:title, ou <title>
  if (!title) {
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (ogTitleMatch) title = ogTitleMatch[1];
  }
  if (!title) {
    const titleTagMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleTagMatch) title = titleTagMatch[1];
  }

  if (!src) return []; // página sem imagem definida

  // Normalizar para URL absoluta
  if (!/^https?:\/\//i.test(src)) {
    src = src.startsWith("/") ? src : "/" + src;
    src = baseUrl + src;
  }

  // Ignorar se for de outro domínio (segurança extra)
  if (!src.includes("observacaoclinica.com")) return [];

  return [
    {
      loc: src,
      title: title ? escapeXml(title.trim().replace(/\s+/g, " ")) : ""
    }
  ];
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ---- NOVO: lê o sitemap.xml anterior (se existir) para depois comparar ----
// Extrai pares <loc, lastmod> do sitemap antigo, num Map "url -> lastmod"
function getPreviousUrlMap() {
  const map = new Map();

  if (!fs.existsSync(sitemapPath)) {
    return map; // primeira vez a correr, não há sitemap anterior
  }

  const oldXml = fs.readFileSync(sitemapPath, "utf8");
  const blocks = oldXml.match(/<url>[\s\S]*?<\/url>/g) || [];

  blocks.forEach(block => {
    const locMatch = block.match(/<loc>([^<]+)<\/loc>/);
    const lastmodMatch = block.match(/<lastmod>([^<]+)<\/lastmod>/);
    if (locMatch) {
      map.set(locMatch[1], lastmodMatch ? lastmodMatch[1] : null);
    }
  });

  return map;
}

const previousUrls = getPreviousUrlMap(); // <-- novo: captura estado ANTES de reescrever

let urls = getUrls(contentDir);

// Remover duplicados (mantendo o último encontrado)
urls = Array.from(
  new Map(urls.map(item => [item.url, item])).values()
);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(page => `
  <url>
<loc>${baseUrl}${page.url}</loc>
  <lastmod>${page.lastmod}</lastmod>
    <priority>${page.priority}</priority>${page.images.map(img => `
    <image:image>
      <image:loc>${img.loc}</image:loc>${img.title ? `
      <image:title>${img.title}</image:title>` : ""}
    </image:image>`).join("")}
  </url>`).join("")}
</urlset>`;

fs.writeFileSync(sitemapPath, sitemap, "utf8");

const totalImages = urls.reduce((sum, p) => sum + p.images.length, 0);

console.log(`✔ Sitemap atualizado com ${urls.length} URLs e ${totalImages} imagens.`);

// ---- NOVO: detecta URLs novas ou com lastmod alterado, e notifica o IndexNow ----
const changedUrls = urls
  .filter(page => {
    const fullUrl = baseUrl + page.url;
    const previousLastmod = previousUrls.get(fullUrl);
    // novo (não existia antes) OU lastmod mudou desde a última vez
    return previousLastmod === undefined || previousLastmod !== page.lastmod;
  })
  .map(page => baseUrl + page.url);

if (changedUrls.length > 0) {
  console.log(`→ ${changedUrls.length} URL(s) nova(s)/atualizada(s), notificando o IndexNow...`);
  notifyIndexNow(changedUrls);
} else {
  console.log("→ Nenhuma URL nova ou alterada, IndexNow não foi notificado.");
}

// CODE PRA RODAR----: node src/sitemap.js