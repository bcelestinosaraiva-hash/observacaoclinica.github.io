const https = require('https');

const HOST = 'observacaoclinica.com';
const KEY = '2fac45ee0fd64138adf49a2002bd45c2';
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