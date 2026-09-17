#!/usr/bin/env node
/**
 * localizar-links-quebrados.js
 *
 * Varre recursivamente uma pasta do site (arquivos .html) procurando
 * padrões de links quebrados/malformados encontrados no Search Console.
 *
 * Uso:
 *   node localizar-links-quebrados.js /caminho/para/a/pasta/do/site
 *
 * Se nenhum caminho for passado, usa a pasta atual (".").
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = process.argv[2] || ".";

// Padrões suspeitos a procurar dentro dos arquivos .html
// (ajuste/adicione conforme for encontrando mais casos no Search Console)
const PADROES = [
    { nome: "Link externo sem https:// (who.int concatenado)", regex: /href=["'][^"']*\/www\.who\.int["']/gi },
    { nome: "Qualquer href terminando em domínio externo sem protocolo", regex: /href=["'][^"']*\/(www\.)?[a-z0-9-]+\.(com|org|gov|int|net)["']/gi },
    { nome: "Slug truncado 'na-gravidez-' sem continuação", regex: /href=["'][^"']*\/na-gravidez-["']/gi },
    { nome: "Slug truncado 'sintomas-malaria' (sem prefixo completo)", regex: /href=["'][^"']*\/sintomas-malaria["']/gi },
    { nome: "URL antiga sem /br/ para o autor (beldo-celestino-saraiva)", regex: /href=["'](?!\/br\/)[^"']*\/beldo-celestino-saraiva\/?["']/gi },
];

let totalEncontrados = 0;

function varrerArquivo(caminhoArquivo) {
    const conteudo = fs.readFileSync(caminhoArquivo, "utf8");
    const linhas = conteudo.split("\n");

    PADROES.forEach(({ nome, regex }) => {
        linhas.forEach((linha, idx) => {
            const matches = linha.match(regex);
            if (matches) {
                matches.forEach((m) => {
                    totalEncontrados++;
                    console.log(`\n[${nome}]`);
                    console.log(`  Arquivo: ${caminhoArquivo}`);
                    console.log(`  Linha:   ${idx + 1}`);
                    console.log(`  Trecho:  ${m}`);
                });
            }
        });
    });
}

function varrerPasta(dir) {
    const itens = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of itens) {
        const caminhoCompleto = path.join(dir, item.name);

        // pula pastas comuns que não interessam
        if (item.isDirectory()) {
            if (["node_modules", ".git", "dist", "build"].includes(item.name)) continue;
            varrerPasta(caminhoCompleto);
        } else if (item.isFile() && item.name.endsWith(".html")) {
            varrerArquivo(caminhoCompleto);
        }
    }
}

console.log(`Procurando links quebrados em: ${path.resolve(ROOT_DIR)}\n`);
varrerPasta(ROOT_DIR);

console.log(`\n----------------------------------------`);
console.log(`Total de ocorrências encontradas: ${totalEncontrados}`);
if (totalEncontrados === 0) {
    console.log("Nenhum padrão conhecido encontrado. Pode ser um caso novo -- adicione um regex em PADROES.");
}