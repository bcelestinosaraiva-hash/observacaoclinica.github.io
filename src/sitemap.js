const fs = require("fs");
const path = require("path");

const baseUrl = "https://www.observacaoclinica.com";
const contentDir = path.join(__dirname, "../");

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
      file === "img" ||
      file === "sitemap.xml" ||
      file.startsWith(".")
    ) {
      return;
    }

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

      // Remover barra final, exceto na raiz
      if (url.length > 1 && url.endsWith("/")) {
        url = url.slice(0, -1);
      }

      // Prioridades
      let priority = "0.7";

      if (url === "/") {
        priority = "1.0";
      } else if (url.split("/").filter(Boolean).length === 1) {
        // categorias: /nutricao, /saude-az, etc.
        priority = "0.8";
      }

      urls.push({
        url,
        lastmod: stat.mtime.toISOString().split("T")[0],
        priority
      });
    }
  });

  return urls;
}

let urls = getUrls(contentDir);

// Remover duplicados
urls = Array.from(
  new Map(urls.map(item => [item.url, item])).values()
);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(page => `
  <url>
    <loc>${baseUrl}${page.url === "/" ? "" : page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <priority>${page.priority}</priority>
  </url>`).join("")}
</urlset>`;

fs.writeFileSync(
  path.join(contentDir, "sitemap.xml"),
  sitemap,
  "utf8"
);

console.log(`✔ Sitemap atualizado com ${urls.length} URLs.`);

// Remover duplicados: node src/sitemap.js