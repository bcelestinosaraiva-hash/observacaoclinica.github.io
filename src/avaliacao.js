let ultimaAvaliacao = null;

// --- LAZY LOAD DO EMAILJS ---
// Só carrega a biblioteca do EmailJS (e faz o init) na primeira vez que
// for mesmo preciso (quando o utilizador clica em SIM/NÃO ou tenta enviar
// o formulário). Antes disso, a página nem descarrega nem executa este
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
    document.getElementById('feedback').style.display = 'block';

    // Aproveita para já começar a carregar o EmailJS em segundo plano,
    // assim quando o utilizador clicar em ENVIAR já deve estar pronto.
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
        mostrarErro('Por favor, escreve o teu nome.');
        return;
    }
    if (!email || !validarEmail(email)) {
        mostrarErro('Por favor, escreve um email válido.');
        return;
    }
    if (!mensagem) {
        mostrarErro('Escreve uma mensagem antes de enviar.');
        return;
    }

    const dados = {
        name: nome,
        email: email,
        avaliacao: ultimaAvaliacao || 'Não informado',
        message: mensagem,
        time: new Date().toLocaleString('pt-PT')
    };

    const enviarBtn = document.querySelector('.submit-btn');
    enviarBtn.disabled = true;
    enviarBtn.textContent = 'A ENVIAR...';

    try {
        // Garante que o EmailJS está carregado antes de enviar (normalmente
        // já estará, porque avaliar() começou a carregá-lo antes).
        await carregarEmailJS();

        await emailjs.send('service_pbebkmd', 'template_c5ituaj', dados);
        document.getElementById('form-feedback').style.display = 'none';
        document.getElementById('msg-sucesso').style.display = 'block';
    } catch (erro) {
        console.error('Erro completo:', erro);
        mostrarErro('Não foi possível enviar agora: ' + (erro.text || erro.message || 'erro desconhecido'));
        enviarBtn.disabled = false;
        enviarBtn.textContent = 'ENVIAR';
    }
}