// check-links.js
// Varre todos os ficheiros .html do projeto e verifica os links
// internos (href="...") em 3 frentes:
//
//   1. Falta de barra final            → /pagina  (devia ser /pagina/)
//   2. Links colados / malformados     → /pagina/www.outro-site.com
//   3. Slug que não corresponde a      → /sintomas-malaria (não existe
//      nenhum ficheiro real do site      nenhum ficheiro com esse path)
//
// Ignora ficheiros (imagens, css, js, xml, etc), âncoras (#...),
// mailto:, tel: e links para outros domínios (exceto quando um outro
// domínio aparece COLADO dentro de um link interno, que é o erro nº 2).
//
// Uso: node check-links.js

const fs = require("fs");
const path = require("path");

// --- CONFIGURAÇÃO -----------------------------------------------------
const ROOT_DIR = "."; // pasta raiz do projeto (onde estão os .html)
const DOMAIN = "observacaoclinica.com";
// Extensões de ficheiro que NUNCA precisam de barra final (ignorar)
const FILE_EXTENSIONS = [
    ".html", ".htm", ".css", ".js", ".xml", ".json", ".webp", ".png",
    ".jpg", ".jpeg", ".svg", ".ico", ".woff", ".woff2", ".pdf", ".txt",
    ".gif", ".mp4", ".webm",
];
// Pastas a ignorar ao varrer o projeto
const IGNORE_DIRS = ["node_modules", ".git", "dist", "build"];
// -----------------------------------------------------------------------

function listHtmlFiles(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (IGNORE_DIRS.includes(entry.name)) continue;
            listHtmlFiles(path.join(dir, entry.name), files);
        } else if (entry.isFile() && entry.name.endsWith(".html")) {
            files.push(path.join(dir, entry.name));
        }
    }
    return files;
}

// Converte o caminho de um ficheiro (ex: "saude-az/o-que-e-pneumonia.html")
// no path de URL real do site (ex: "/saude-az/o-que-e-pneumonia/").
// "index.html" e ficheiros na raiz da pasta viram a própria pasta.
function fileToUrlPath(filePath) {
    let rel = path.relative(ROOT_DIR, filePath).replace(/\\/g, "/");
    if (rel.toLowerCase() === "index.html") return "/";
    rel = rel.replace(/\.html$/i, "");
    if (rel.toLowerCase().endsWith("/index")) {
        rel = rel.slice(0, -"/index".length);
    }
    return "/" + rel + "/";
}

function hasFileExtension(url) {
    const clean = url.split("?")[0].split("#")[0];
    return FILE_EXTENSIONS.some((ext) => clean.toLowerCase().endsWith(ext));
}

function isInternalLink(url) {
    if (
        url.startsWith("#") ||
        url.startsWith("mailto:") ||
        url.startsWith("tel:") ||
        url.startsWith("javascript:")
    ) {
        return false;
    }
    if (url.startsWith("/") && !url.startsWith("//")) return true;
    // só conta como interno se o domínio for mesmo o HOST do link
    // (início do URL), nunca se aparecer só dentro de query params,
    // paths de terceiros, etc. Ex: mail.google.com/...?to=x@observacaoclinica.com
    // NÃO deve contar como link interno.
    const hostRegex = new RegExp(`^https?://(www\\.)?${DOMAIN.replace(".", "\\.")}(/|$|\\?|#)`, "i");
    return hostRegex.test(url);
}

// Normaliza um href interno (absoluto ou relativo) para um path
// comparável com fileToUrlPath, ex: "https://observacaoclinica.com/x" -> "/x"
function normalizeInternalPath(url) {
    let clean = url.split("?")[0].split("#")[0];
    clean = clean.replace(/^https?:\/\/(www\.)?observacaoclinica\.com/i, "");
    if (clean === "") clean = "/";
    return clean;
}

// Deteta um segundo domínio "colado" dentro de um link interno,
// ex: ".../hipertensao-arterial-mas-porque/www.who.int"
function findGluedForeignDomain(url) {
    const withoutOwnDomain = url.replace(
        new RegExp(`https?://(www\\.)?${DOMAIN.replace(".", "\\.")}`, "i"),
        ""
    );
    const glued = withoutOwnDomain.match(/[a-z0-9-]+\.[a-z]{2,}(\.[a-z]{2,})?/gi);
    if (!glued) return null;
    // ignora se o próprio match for o domínio do site
    const suspicious = glued.filter(
        (m) => !m.toLowerCase().includes(DOMAIN.toLowerCase())
    );
    return suspicious.length > 0 ? suspicious[0] : null;
}

function checkFile(filePath, knownPaths) {
    const content = fs.readFileSync(filePath, "utf8");
    const hrefRegex = /href="([^"]+)"/g;
    const issues = [];
    let match;

    while ((match = hrefRegex.exec(content)) !== null) {
        const url = match[1];
        if (!isInternalLink(url)) continue;
        if (hasFileExtension(url)) continue; // imagens/css/js/etc não são validados

        // 2. link colado / malformado
        const glued = findGluedForeignDomain(url);
        if (glued) {
            issues.push({ type: "colado", url, detail: `domínio colado: ${glued}` });
            continue; // não faz sentido validar barra/slug de um link já quebrado
        }

        const cleanUrl = url.split("?")[0].split("#")[0];

        // 1. falta barra final
        if (!cleanUrl.endsWith("/")) {
            issues.push({ type: "sem-barra", url, detail: "falta barra final" });
            continue;
        }

        // 3. slug que não corresponde a nenhum ficheiro real
        const normalized = normalizeInternalPath(cleanUrl);
        if (!knownPaths.has(normalized)) {
            issues.push({ type: "slug-invalido", url, detail: "path não existe no projeto" });
        }
    }

    return issues;
}

function main() {
    const htmlFiles = listHtmlFiles(ROOT_DIR);
    const knownPaths = new Set(htmlFiles.map(fileToUrlPath));

    console.log(`🔍 A verificar ${htmlFiles.length} ficheiros .html...\n`);

    let total = 0;
    const counts = { "sem-barra": 0, colado: 0, "slug-invalido": 0 };

    for (const file of htmlFiles) {
        const issues = checkFile(file, knownPaths);
        if (issues.length > 0) {
            total += issues.length;
            console.log(`📄 ${file}`);
            for (const issue of issues) {
                counts[issue.type]++;
                const icon =
                    issue.type === "colado" ? "🔴" : issue.type === "slug-invalido" ? "🟠" : "🟡";
                console.log(`   ${icon} ${issue.url}  —  ${issue.detail}`);
            }
            console.log("");
        }
    }

    if (total === 0) {
        console.log("✅ Nenhum problema encontrado nos links internos.");
    } else {
        console.log(`⚠️  Total: ${total} problema(s) encontrados:`);
        console.log(`   🟡 Sem barra final: ${counts["sem-barra"]}`);
        console.log(`   🔴 Links colados/malformados: ${counts["colado"]}`);
        console.log(`   🟠 Slugs que não existem no projeto: ${counts["slug-invalido"]}`);
    }
}

main();