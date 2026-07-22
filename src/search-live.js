// BANCO DE DADOS
const pages = [
  { title: "", url: "" },
  { title: "O que é candidíase vaginal: sintomas, causas, prevenção e tratamento", url: "/saude-intima/o-que-e-candidiase-vaginal/" },
  { title: "O que é Clotrimazol 2% creme vaginal, para que é utilizado, é candidíase?", url: "/saude-intima/o-que-e-clotrimazol-creme-vaginal/" },
  { title: "Ebola: o que é, os sinais e sintomas, transmissão, tratamento e prevenção", url: "/saude-az/o-que-e-ebola-e-sua-prevencao/" },
  { title: "Importância da prevenção de cáries para a saúde bucal", url: "/saude-bucal/importancia-da-prevencao-de-carie-dentaria/" },
  { title: "Treino de força e hipertrofia funcional: para ganhar massa e melhorar o corpo", url: "/fitness/treino-para-ganhar-massa-muscular/" },
  { title: "Asma: os sinais e sintomas, as cauas e sua prevenção", url: "/saude-az/asma-sintomas-tratamento/" },
  { title: "O que é sinusite: as causas, prevenção, sinais e sintomas e possíveis tratamentos", url: "/saude-az/o-que-e-sinusite/" },
  { title: "O que é uma bronquiolite: sinais e sintomas, as causas e os seus tipos", url: "/saude-az/o-que-e-bronquiolite/" },
  { title: "O que é uma bronquite: sinais e sintomas e os seus tipos e como se prevenir?", url: "/saude-az/o-que-e-bronquite-e-como-prevenir/" },
  { title: "O que é tuberculose seus sinais e sintomas e suas medidas preventivas?", url: "/saude-az/o-que-e-tuberculose/" },
  { title: "O que é diabetes: as causas, sinais e sintomas que você não deve ignorar", url: "/nutricao/o-que-e-diabetes/" },
  { title: "O que é Malária, sinais e sintomas, causas, prevenção e o tratamento da malaria", url: "/saude-az/como-se-prevenir-da-malaria/" },
  { title: "O que é uma hipertensão, mas porque?", url: "/saude-az/hipertensao-arterial-mas-porque/" },
  { title: "O que é acidente vascular cerebral ou (AVC)?", url: "/saude-az/o-que-e-avc/" },
  { title: "Ansiedade: sintomas, causas e como controlar de forma eficaz", url: "/saude-mental/ansiedade-sintomas/" },
  { title: "Alimentos para idosos: garantindo saúde, energia e qualidade de vida dos idosos", url: "/nutricao/alimentos-para-os-idosos/" },
  { title: "Dieta para hipertensos: alimentação saudável para controlar a pressão alta", url: "/nutricao/dieta-para-pessoa-hipertensa/" },
  { title: "Quem e Beldo Celestino Saraiva", url: "/equipa/beldo-celestino-saraiva/" },
  { title: "Aleitamento materno: importância e benefícios para a mãe e o bebê", url: "/nutricao/aleitamento-materno/" },
  { title: "Sintomas de gravidez: como identificar os primeiros sinais com segurança", url: "/gravidez/sintomas-de-gravidez/" },
  { title: "O que é observação clínica", url: "/sobre/" },
  { title: "7 Sintomas de Meningite que parecem gripe: Não espere pela rigidez na nuca", url: "/saude-az/7-sintomas-de-meningite-que-parecem-gripe/" },
  { title: "O que é Bronquiolite", url: "/saude-az/o-que-e-bronquiolite/" },
  { title: "8 tratamentos de pneumonia: medicamento usado, cuidados e recuperação", url: "/saude-az/o-tratamento-da-pneumonia/" },
  { title: "O que é a tuberculose (TB)? e como tratar?", url: "/saude-az/o-que-e-tuberculose/" },
  { title: "Como calcular a prescrição médica dos pacientes com base no peso e medicação?", url: "/calculadoras/como-calcular-a-prescricao/" },
  { title: "Como calcular o Bolo de dextrose 10%?", url: "/calculadoras/como-calcular-dextrose/" },
  { title: "Como calcular o meu ciclo menstrual e identificar a sua próxima menstruação?", url: "/calculadoras/como-calcular-o-ciclo-menstrual/" },
  { title: "As necessidades nutricionais das crianças de acordo faixa etária", url: "/nutricao/as-necessidades-nutricionais-das-criancas/" },
  { title: "Introdução de alimentos complementares nas crianças aos seus 6 meses de idades", url: "/nutricao/introducao-de-alimentos/" },
  { title: "Doenças respiratórias", url: "/saude-az/doencas-respiratorias/" },
  { title: "O que é pneumonia?", url: "/saude-az/o-que-e-pneumonia/" },
  { title: "Calculadora de diluição para enfermagem, os mililitros administrados nos utentes", url: "/calculadoras/como-calcular-a-diluicao/" },
  { title: "Como calcular o meu índice de massa corporal IMC para saber o seu peso ideal?", url: "/calculadoras/como-calcular-indice-de-massa-corporal/" },
  { title: "Como calcular minha idade gestacional e identificar o dia do meu parto", url: "/calculadoras/idade-gestacional/" },
  { title: "O que é Mioclonia: sinais e sintomas, factores, causas e tratamentos", url: "/saude-mental/o-que-e-mioclonia/" },
  { title: " O que é cárie dentária: causas, sintomas e como evitar de forma eficaz", url: "/saude-bucal/o-que-e-carie-dentaria/" },
  { title: "Prevenção de cáries ", url: "/saude-bucal/o-que-e-carie-dentaria/" },
  { title: "Como calcular período fértil e identificar se irei engravidar?", url: "/calculadoras/como-calcular-meu-periodo-fertil/" },
  { title: "Como calcular o meu período fértil e identificar se irei engravidar?", url: "/calculadoras/como-calcular-meu-periodo-fertil/" },
  { title: "Como calcular imc para saber o seu peso ideal?", url: "/calculadoras/como-calcular-indice-de-massa-corporal/" },
  { title: "Sinais de que você está em trabalho de parto: como identificar e quando ir ao hospital", url: "/gravidez/sinais-de-trabalho-de-parto/" },
  { title: "Sinais de trabalho de parto", url: "/gravidez/sinais-de-trabalho-de-parto/" },
  { title: "Insuficiência renal crónica: o que é, sintomas, causas e prevenção", url: "/saude-az/insuficiencia-renal/" },
  { title: "Cólicas menstruais: sinais e sintomas e como aliviar de forma natural", url: "/saude-intima/o-que-sao-colicas-menstruais/" },
  { title: "Atraso menstrual: 12 causas além da gravidez que você precisa conhecer", url: "/saude-intima/atraso-menstrual-12-causas-alem-da-gravidez/" },
  { title: "Alimentação na gravidez: o que comer para uma gestação saudável", url: "/gravidez/alimentacao-na-gravidez/" },
  { title: "", url: "" },
  { title: "", url: "" },
  { title: "", url: "" },
  { title: "", url: "" },
];
// ELEMENTOS
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const mobileBtn = document.getElementById('mobile-search-button');
const mobileBar = document.getElementById('search-input-bar');
const mobileInput = document.getElementById('search-input-mobile-top');
const mobileResults = document.getElementById('search-results-mobile-top');
// =====================
// DESKTOP
// =====================
searchBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  searchInput.classList.toggle('hidden');
  searchInput.focus();
});

searchInput.addEventListener('input', (e) => {
  doSearch(e.target.value, searchResults);
});

// =====================
// MOBILE
// =====================
mobileBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  mobileBar.classList.toggle('hidden');
  setTimeout(() => mobileInput.focus(), 100);
});

mobileInput.addEventListener('input', (e) => {
  doSearch(e.target.value, mobileResults);
});

// =====================
// FUNÇÃO DE BUSCA
// =====================
function doSearch(query, container) {
  if (!query) {
    container.classList.add('hidden');
    return;
  }

  const results = pages.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  container.innerHTML = results.length
    ? results.map(r =>
      `<a href="${r.url}" class="block py-2 p-2 hover:text-blue-400">${r.title}</a>`
    ).join('')
    : `<div class="p-3 text-gray-500">Sem resultados, iremos atualizar</div>`;
  container.classList.remove('hidden');
}

// =====================
// FECHAR AO CLICAR FORA
// =====================
document.addEventListener('click', (e) => {

  if (!searchResults.contains(e.target) && e.target !== searchInput && e.target !== searchBtn) {
    searchResults.classList.add('hidden');
  }
  if (!mobileBar.contains(e.target) && e.target !== mobileBtn) {
    mobileBar.classList.add('hidden');
  }
});
// =====================
// ESC FECHA TUDO
// =====================
document.addEventListener('keydown', (e) => {
  if (e.key === "Escape") {
    mobileBar.classList.add('hidden');
    searchResults.classList.add('hidden');
    searchInput.classList.add('hidden');
  }
});
// FIM JS