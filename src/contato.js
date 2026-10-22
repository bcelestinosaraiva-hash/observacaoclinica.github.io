let ultimaAvaliacao = null;

// --- LAZY LOAD DO EMAILJS ---
let emailjsPromise = null;

function carregarEmailJS() {
    if (typeof emailjs !== 'undefined' && emailjs.send) {
        return Promise.resolve();
    }
    if (emailjsPromise) return emailjsPromise;

    emailjsPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.onload = () => {
            try {
                emailjs.init({ publicKey: 'QMRZTfkjBwZgN13Iu' });
                resolve();
            } catch (e) {
                emailjsPromise = null;
                reject(e);
            }
        };
        script.onerror = () => {
            emailjsPromise = null;
            reject(new Error('Não foi possível carregar o serviço de envio.'));
        };
        document.head.appendChild(script);
    });

    return emailjsPromise;
}
// --- FIM DO LAZY LOAD ---

function avaliar(tipo) {
    ultimaAvaliacao = tipo;
    const fb = document.getElementById('feedback');
    if (fb) fb.style.display = 'block';
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mostrarErro(texto) {
    const erroEl = document.getElementById('erro-form');
    erroEl.textContent = texto;
    erroEl.style.display = 'block';

    const sucessoEl = document.getElementById('sucesso-form');
    if (sucessoEl) sucessoEl.style.display = 'none';
}

async function enviar() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const mensagem = document.getElementById('mensagem').value.trim();
    const erroEl = document.getElementById('erro-form');
    const sucessoEl = document.getElementById('sucesso-form');

    erroEl.style.display = 'none';
    if (sucessoEl) sucessoEl.style.display = 'none';

    if (!nome) {
        mostrarErro('Por favor, escreva o seu nome.');
        return;
    }
    if (!email || !validarEmail(email)) {
        mostrarErro('Por favor, escreva um email válido.');
        return;
    }
    if (!mensagem) {
        mostrarErro('Escreva uma mensagem antes de enviar.');
        return;
    }

    const dados = {
        name: nome,
        email: email,
        avaliacao: ultimaAvaliacao || 'CONTACTO',
        message: mensagem,
        time: new Date().toLocaleString('pt-PT')
    };

    const enviarBtn = document.querySelector('.submit-btn');
    enviarBtn.disabled = true;
    enviarBtn.textContent = 'A ENVIAR...';

    try {
        await carregarEmailJS();
        await emailjs.send('service_pbebkmd', 'template_c5ituaj', dados);

        document.getElementById('form-feedback').reset();

        if (sucessoEl) {
            sucessoEl.style.display = 'block';
            setTimeout(() => { sucessoEl.style.display = 'none'; }, 5000);
        }
    } catch (erro) {
        console.error('Erro completo:', erro);
        mostrarErro('Não foi possível enviar agora: ' + (erro.text || erro.message || 'erro desconhecido'));
    } finally {
        enviarBtn.disabled = false;
        enviarBtn.textContent = 'ENVIAR';
    }
}

// Começa a carregar o EmailJS quando o utilizador interage com o formulário
(function () {
    const form = document.getElementById('form-feedback');
    if (!form) return;
    const pre = () => carregarEmailJS().catch(() => { });
    form.addEventListener('focusin', pre, { once: true });
    form.addEventListener('pointerdown', pre, { once: true });
})();