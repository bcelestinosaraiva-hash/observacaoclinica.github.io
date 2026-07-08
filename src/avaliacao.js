
let ultimaAvaliacao = null;

function avaliar(tipo) {
    ultimaAvaliacao = tipo;
    document.getElementById('feedback').style.display = 'block';
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mostrarErro(texto) {
    const erroEl = document.getElementById('erro-form');
    erroEl.textContent = texto;
    erroEl.style.display = 'block';
}

function enviar() {
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

    emailjs.send('service_pbebkmd', 'template_c5ituaj', dados)
        .then(() => {
            document.getElementById('form-feedback').style.display = 'none';
            document.getElementById('msg-sucesso').style.display = 'block';
        })
        .catch((erro) => {
            console.error('Erro completo:', erro);
            mostrarErro('Não foi possível enviar agora: ' + (erro.text || erro.message || 'erro desconhecido'));
            enviarBtn.disabled = false;
            enviarBtn.textContent = 'ENVIAR';
        });
}
