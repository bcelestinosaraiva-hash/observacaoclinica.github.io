let ultimaAvaliacao = null;

// --- LAZY LOAD DO EMAILJS ---
// Só carrega a biblioteca do EmailJS (e faz o init) na primeira vez que
// for mesmo preciso. Antes disso, a página nem descarrega nem executa este
// script, poupando tempo de bloqueio no arranque da página.
let emailjsCarregado = false;

function carregarEmailJS() {
    return new Promise((resolve, reject) => {
        if (emailjsCarregado) return resolve();

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.onload = () => {
            emailjs.init('QMRZTfkjBwZgN13Iu');
            emailjsCarregado = true;
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
// --- FIM DO LAZY LOAD ---

async function avaliar(tipo) {
    ultimaAvaliacao = tipo;
    const fb = document.getElementById('feedback');
    if (fb) fb.style.display = 'block';

    // Começa a carregar o EmailJS em segundo plano
    carregarEmailJS().catch((erro) => console.error('Erro ao carregar EmailJS:', erro));
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mostrarErro(texto) {
    const erroEl = document.getElementById('erro-form');
    erroEl.textContent = texto;
    erroEl.style.display = 'block';
}

async function enviar() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const mensagem = document.getElementById('mensagem').value.trim();
    const erroEl = document.getElementById('erro-form');
    erroEl.style.display = 'none';

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
        time: new Date().toLocaleString('pt-BR')
    };

    const enviarBtn = document.querySelector('.submit-btn');
    enviarBtn.disabled = true;
    enviarBtn.textContent = 'A ENVIAR...';

    try {
        // Garante que o EmailJS está carregado antes de enviar
        await carregarEmailJS();

        await emailjs.send('service_pbebkmd', 'template_c5ituaj', dados);

        document.getElementById('form-feedback').style.display = 'none';
        document.getElementById('sucesso-form').style.display = 'block';
    } catch (erro) {
        console.error('Erro completo:', erro);
        mostrarErro('Não foi possível enviar agora: ' + (erro.text || erro.message || 'erro desconhecido'));
        enviarBtn.disabled = false;
        enviarBtn.textContent = 'ENVIAR';
    }
}

// Pré-carrega o EmailJS quando a pessoa toca/clica no formulário
(function () {
    const form = document.getElementById('form-feedback');
    if (!form) return;
    const pre = () => carregarEmailJS().catch(() => { });
    form.addEventListener('focusin', pre, { once: true });
    form.addEventListener('pointerdown', pre, { once: true });
})();

// Abre o Gmail na web (só no computador); no telemóvel usa o mailto: normal
(function () {
    const ehTelemovel = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (ehTelemovel) return;

    document.querySelectorAll('a[data-gmail]').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = 'https://mail.google.com/mail/?view=cm&fs=1'
                + '&to=' + encodeURIComponent(link.dataset.gmail)
                + '&su=' + encodeURIComponent('Contato via site')
                + '&body=' + encodeURIComponent('Olá, gostaria de ...');
            window.open(url, '_blank', 'noopener,noreferrer');
        });
    });
})();