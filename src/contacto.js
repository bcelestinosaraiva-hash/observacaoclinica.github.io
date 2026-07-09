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

    const sucessoEl = document.getElementById('sucesso-form');
    if (sucessoEl) sucessoEl.style.display = 'none';
}

function enviar() {
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
        avaliacao: ultimaAvaliacao || 'Não informado',
        message: mensagem,
        time: new Date().toLocaleString('pt-PT')
    };

    const enviarBtn = document.querySelector('.submit-btn');
    enviarBtn.disabled = true;
    enviarBtn.textContent = 'A ENVIAR...';

    emailjs.send('service_pbebkmd', 'template_c5ituaj', dados)
        .then(() => {
            document.getElementById('form-feedback').reset();

            if (sucessoEl) {
                sucessoEl.style.display = 'block';
            }

            enviarBtn.disabled = false;
            enviarBtn.textContent = 'ENVIAR';

            setTimeout(() => {
                if (sucessoEl) sucessoEl.style.display = 'none';
            }, 5000);
        })
        .catch((erro) => {
            console.error('Erro completo:', erro);
            mostrarErro('Não foi possível enviar agora: ' + (erro.text || erro.message || 'erro desconhecido'));
            enviarBtn.disabled = false;
            enviarBtn.textContent = 'ENVIAR';
        });
}