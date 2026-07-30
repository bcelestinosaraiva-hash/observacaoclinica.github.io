/**
 * add-pinterest-verify.js
 *
 * Insere automaticamente a meta tag de verificação do Pinterest
 * em todos os arquivos .html do projeto, dentro do <head>.
 *
 * Como usar:
 *   node add-pinterest-verify.js
 *
 * Pode ajustar a pasta raiz (ROOT_DIR) e a tag (META_TAG) abaixo.
 */

const fs = require('fs');
const path = require('path');

// ---- CONFIGURAÇÃO ----
const ROOT_DIR = '.'; // pasta raiz do projeto (onde estão os .html)
const META_TAG = '<meta name="p:domain_verify" content="4a116f9b30f9aff57aab5dacfdbd3893"/>';

// pastas a ignorar (não precisa mexer nisso)
const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build']);

let filesUpdated = 0;
let filesSkipped = 0;
let filesAlreadyHadTag = 0;

/**
 * Percorre recursivamente a pasta procurando arquivos .html
 */
function findHtmlFiles(dir) {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (!IGNORED_DIRS.has(entry.name)) {
                results = results.concat(findHtmlFiles(fullPath));
            }
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            results.push(fullPath);
        }
    }

    return results;
}

/**
 * Insere a meta tag dentro do <head> de um arquivo, se ainda não existir
 */
function addMetaTagToFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Se a tag já existir (mesmo conteúdo), não faz nada
    if (content.includes('p:domain_verify')) {
        filesAlreadyHadTag++;
        return;
    }

    // Procura o <head> (ou <head ...> com atributos) e insere logo depois
    const headRegex = /<head[^>]*>/i;

    if (!headRegex.test(content)) {
        console.log(`⚠️  Sem <head> encontrado, ignorado: ${filePath}`);
        filesSkipped++;
        return;
    }

    content = content.replace(headRegex, (match) => `${match}\n  ${META_TAG}`);

    fs.writeFileSync(filePath, content, 'utf-8');
    filesUpdated++;
    console.log(`✅ Atualizado: ${filePath}`);
}

// ---- EXECUÇÃO ----
console.log('🔍 A procurar arquivos .html...\n');

const htmlFiles = findHtmlFiles(ROOT_DIR);

console.log(`Encontrados ${htmlFiles.length} arquivos .html.\n`);

htmlFiles.forEach(addMetaTagToFile);

console.log('\n--- Resumo ---');
console.log(`✅ Atualizados: ${filesUpdated}`);
console.log(`↩️  Já tinham a tag: ${filesAlreadyHadTag}`);
console.log(`⚠️  Ignorados (sem <head>): ${filesSkipped}`);