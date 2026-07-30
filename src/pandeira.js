// hreflang.js
const fs = require("fs");
const path = require("path");

const root = "."; // pasta raiz do projeto
const canonicalRegex = /<link rel="canonical"\s+href="([^"]+)">/;

function processFile(filePath) {
    let html = fs.readFileSync(filePath, "utf-8");

    if (html.includes('hreflang="pt"')) return; // já tem, ignora

    const match = html.match(canonicalRegex);
    if (!match) return;

    const url = match[1];
    const hreflangBlock =
        `<link rel="canonical"\n        href="${url}">\n\n` +
        `    <!-- Hreflang -->\n` +
        `    <link rel="alternate" hreflang="pt" href="${url}">\n` +
        `    <link rel="alternate" hreflang="x-default" href="${url}">`;

    html = html.replace(match[0], hreflangBlock);
    fs.writeFileSync(filePath, html);
    console.log("Atualizado:", filePath);
}

function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== "node_modules") walk(full);
        else if (entry.name.endsWith(".html")) processFile(full);
    });
}

walk(root);