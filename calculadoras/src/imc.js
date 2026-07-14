// ==========================================================================
// Calculadora de IMC — lógica: OC
// ==========================================================================

let sexoSelecionado = 'Mulher';

const btnMulher = document.getElementById('sexo-mulher');
const btnHomem = document.getElementById('sexo-homem');
const calcularBtn = document.getElementById('calcular');
const resultadoDiv = document.getElementById('resultado');

// ---------- seleção de sexo ----------

btnMulher.classList.add('bg-purple-300', 'text-black'); // estado inicial

btnMulher.addEventListener('click', () => {
  sexoSelecionado = 'Mulher';
  btnMulher.classList.add('bg-purple-300', 'text-black');
  btnHomem.classList.remove('bg-purple-300', 'text-black');
  btnHomem.classList.add('bg-blue-100', 'text-black');
});

btnHomem.addEventListener('click', () => {
  sexoSelecionado = 'Homem';
  btnHomem.classList.add('bg-purple-300', 'text-black');
  btnMulher.classList.remove('bg-purple-300', 'text-black');
  btnMulher.classList.add('bg-blue-100', 'text-black');
});

// ---------- tabela de classificações ----------
// cada entrada define: limite superior (exclusivo), nome, classe css e recomendação

const CLASSIFICACOES = [
  {
    id: 'baixo',
    limite: 18.5,
    nome: 'Abaixo do peso',
    classe: 'classe-baixo',
    icone: 'xis',
    recomendacao: 'O teu peso está abaixo do recomendado para a tua altura. Procura um nutricionista para avaliar a tua alimentação e considera aumentar a ingestão calórica de forma equilibrada, com acompanhamento de exercícios de fortalecimento muscular.'
  },
  {
    id: 'normal',
    limite: 25,
    nome: 'Peso normal',
    classe: 'classe-normal',
    icone: 'check',
    recomendacao: 'Parabéns! O teu IMC está dentro da faixa considerada saudável. Mantém uma alimentação equilibrada, pratica actividade física regular e continua com check-ups de saúde periódicos.'
  },
  {
    id: 'sobre',
    limite: 30,
    nome: 'Sobrepeso',
    classe: 'classe-sobre',
    icone: 'xis',
    recomendacao: 'O teu IMC indica sobrepeso. Pequenos ajustes na alimentação e o aumento da actividade física (150 min/semana) já ajudam bastante. Considera falar com um profissional de saúde para um plano personalizado.'
  },
  {
    id: 'ob1',
    limite: 35,
    nome: 'Obesidade Grau I',
    classe: 'classe-ob1',
    icone: 'xis',
    recomendacao: 'O teu IMC está na faixa de Obesidade Grau I. É recomendável procurar orientação médica e nutricional para construir um plano seguro de perda de peso e reduzir riscos cardiovasculares.'
  },
  {
    id: 'ob2',
    limite: 40,
    nome: 'Obesidade Grau II',
    classe: 'classe-ob2',
    icone: 'xis',
    recomendacao: 'O teu IMC está na faixa de Obesidade Grau II, considerada severa. Procura acompanhamento médico o quanto antes para avaliar riscos de saúde e definir um plano de tratamento adequado.'
  },
  {
    id: 'ob3',
    limite: Infinity,
    nome: 'Obesidade Grau III',
    classe: 'classe-ob3',
    icone: 'xis',
    recomendacao: 'O teu IMC está na faixa de Obesidade Grau III (mórbida). É muito importante procurar acompanhamento médico especializado o mais rápido possível para avaliar o teu estado de saúde geral.'
  }
];

function obterClassificacao(imc) {
  return CLASSIFICACOES.find(c => imc < c.limite);
}

// ---------- cálculo ----------
calcularBtn.addEventListener('click', () => {
  const idade = parseInt(document.getElementById('idade').value, 10);
  const altura = parseFloat(document.getElementById('altura').value) / 100;
  const peso = parseFloat(document.getElementById('peso').value);

  if (!idade || !altura || !peso) {
    resultadoDiv.innerHTML = `
      <div class="bg-white text-gray-800 mt-10 p-2 py-2 rounded">
        Preencha todos os campos necessários!
      </div>`;
    return;
  }

  const imc = parseFloat((peso / (altura * altura)).toFixed(1));
  const info = obterClassificacao(imc);
  const iconeHtml = info.icone === 'check' ? '✓' : '✕';

  resultadoDiv.innerHTML = `
    <div class="resultado-card">

      <div class="imc-valor ${info.classe}">
        ${imc} kg/m²
      </div>

      <div class="classificacao ${info.classe}">
        <span class="${info.icone}">${iconeHtml}</span>
        ${info.nome}
      </div>

      <div class="recomendacao ${info.classe}">
        <strong>Recomendação</strong>
        ${info.recomendacao}
      </div>

      <div class="tabela-imc">
        <div class="baixo ${info.id === 'baixo' ? 'ativo' : ''}">
          <span>Baixo peso</span>
          <span>&lt; 18.5</span>
        </div>

        <div class="normal ${info.id === 'normal' ? 'ativo' : ''}">
          <span>Peso normal</span>
          <span>18.5 - 24.9</span>
        </div>

        <div class="sobre ${info.id === 'sobre' ? 'ativo' : ''}">
          <span>Sobrepeso</span>
          <span>25 - 29.9</span>
        </div>

        <div class="ob1 ${info.id === 'ob1' ? 'ativo' : ''}">
          <span>Obesidade Grau I</span>
          <span>30 - 34.9</span>
        </div>

        <div class="ob2 ${info.id === 'ob2' ? 'ativo' : ''}">
          <span>Obesidade Grau II</span>
          <span>35 - 39.9</span>
        </div>

        <div class="ob3 ${info.id === 'ob3' ? 'ativo' : ''}">
          <span>Obesidade Grau III</span>
          <span>≥ 40</span>
        </div>
      </div>

    </div>
  `;

  resultadoDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});