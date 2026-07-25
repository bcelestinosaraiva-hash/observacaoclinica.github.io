/**
 * indexnow.js
 * Notifica o Bing (e outros motores participantes: Yandex, Seznam, Naver)
 * sobre URLs novas ou atualizadas do observacaoclinica.com via protocolo IndexNow.
 *
 * DOCS: https://www.indexnow.org/
 *
 * COMO USAR:
 * 1. Gere uma chave (qualquer string hexadecimal de 32-128 caracteres). Pode ser feito com:
 *      node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 * 2. Crie um ficheiro na raiz do site chamado "<SUA_CHAVE>.txt" contendo apenas a própria chave.
 *    Ex: se a chave for "abc123...", crie o ficheiro "abc123....txt" na raiz (mesmo nível do index.html)
 *    com o conteúdo "abc123...". Isso prova que controlas o domínio.
 * 3. Publique esse ficheiro junto com o site (deve ficar acessível em
 *    https://observacaoclinica.com/<SUA_CHAVE>.txt)
 * 4. Preencha HOST e KEY abaixo.
 * 5. Chame notifyIndexNow([...urls]) sempre que publicares ou atualizares um artigo.
 *    Podes chamar isto no final do teu sitemap.js, passando as URLs novas/alteradas.
 */

const https = require('https');

const HOST = 'observacaoclinica.com';
const KEY = '1efbeea56dcc4dafb34937693d7b3fe6';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

/**
 * Notifica o IndexNow sobre uma lista de URLs (novas ou atualizadas).
 * @param {string[]} urls - lista de URLs completas, ex: ['https://observacaoclinica.com/artigo-x.html']
 */
function notifyIndexNow(urls) {
    if (!urls || urls.length === 0) {
        console.log('IndexNow: nenhuma URL para notificar.');
        return;
    }

    const payload = JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: KEY_LOCATION,
        urlList: urls,
    });

    const options = {
        hostname: 'api.indexnow.org',
        path: '/indexnow',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(payload),
        },
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
            if (res.statusCode === 200 || res.statusCode === 202) {
                console.log(`IndexNow: ${urls.length} URL(s) submetida(s) com sucesso (status ${res.statusCode}).`);
            } else {
                console.error(`IndexNow: falha ao submeter (status ${res.statusCode}).`, body);
            }
        });
    });

    req.on('error', (err) => {
        console.error('IndexNow: erro na requisição:', err.message);
    });

    req.write(payload);
    req.end();
}

module.exports = { notifyIndexNow };

// Exemplo de uso direto via linha de comando:
// node indexnow.js https://observacaoclinica.com/novo-artigo.html
if (require.main === module) {
    const urls = process.argv.slice(2);
    if (urls.length === 0) {
        console.log('Uso: node indexnow.js <url1> <url2> ...');
    } else {
        notifyIndexNow(urls);
    }
}