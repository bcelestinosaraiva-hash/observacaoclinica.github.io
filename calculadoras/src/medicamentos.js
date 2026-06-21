// PRESCRCAO
const DRUGS = {
  'Artesunato': { name: 'Artesunato', rule: w => w > 0 && w < 20 ? 3 : 2.4, note: 'paciente com peso menor de 20 kg constante é 3mg/kg; paciente maior ou igual a 20kg constante é 2.4 mg/kg. NB: as primeiras doses de ataques são administradas 12/12 horas. Depois da 3ª dose, as doses restantes são administradas 24/24 horas isto é uma vez por dia, durante 7 dias equivalentes a 9 doses. ', source: 'OMS.', divideBy: 1 },
  'Artesunato (Arginina)': { name: 'Artesunato (Arginina)', rule: w => w > 0 && w < 20 ? 3 : 2.4, note: 'paciente menor de 20 kg, constante é 3mg/kg; e paciente maior ou igual a 20kg, constante é 2.4mg/kg. NB: as primeiras doses de ataques são administradas 12/12 horas. Depois da 3ª dose, as doses restantes são administradas 24/24 horas isto é uma vez por dia, durante 7 dias equivalentes a 9 doses. ', source: 'OMS.', divideBy: 1 },
  'Ceftriaxona': { name: 'Ceftriaxona (1 g)', rule: w => 50, note: '50 mg/kg. Dividir em 2 tomadas', source: 'Protocolos clínicos da ITL', divideBy: 2 },
  'Cloranfenicol': { name: 'Cloranfenicol (1 g)', rule: w => 50, note: '50 mg/kg. Dividir em 2 tomadas', source: 'Protocolos clínicos ITL', divideBy: 2 },
  'Gentamicina': { name: 'Gentamicina', rule: w => w < 20 ? 5 : 7.5, note: '<20kg → 5 mg/kg; ≥20kg → 7.5 mg/kg', source: 'MISAU', divideBy: 2 },
  'Paracetamol': { name: 'Paracetamol (1 g)', rule: w => 15, note: '15 mg/kg. Dividir em 3 tomadas', source: 'Protocolos clínicos', divideBy: 3 },
  'Paracetamol susp': { name: 'Paracetamol susp. 120 mg', rule: w => 15, note: '15 mg/kg. Dividir em 3 tomadas', source: 'Protocolos clínicos da ITL', divideBy: 3 },
  'Prazequantel': { name: 'Prazequantel, comp 600 mg', rule: w => 40, note: '40 mg/kg. Dividir 600 mg para ver quantos comprimidos. Quer saber a quantidade de fármaco a administrar faz por seguinte prescrição dividir por 600 mg.', source: 'IPOBEN', divideBy: 1 },
  'Penicilina cristalizada': { name: 'Penicilina cristalizada, inject 1 milhao UI', rule: w => 50000, note: '50000 mg/kg. Dividir em 4 tomadas', source: 'Protocolos clínicos', divideBy: 4 },
  'Diazepam': { name: 'Diazepam, inject 10 mg/ 2 ml', rule: w => 0.2, note: '0.2 mg/kg. Dividir em 1 tomadas. Constantes para adulto é 5 a 10 mg.', source: 'Protocolos clínicos', divideBy: 1 },
  'Metronidazol': { name: 'Metronidazol 500 mg ', rule: w => 7.5, note: '7.5 mg/kg. Dividir em 3 tomadas', source: 'Protocolos clínicos da ITL', divideBy: 3 },
  'Ampicilina': { name: 'Ampicilina 500 mg ', rule: w => 100, note: '100 mg/kg. Dividir em 4 tomadas', source: 'Protocolos clínicos da ITL', divideBy: 4 },
  'Metronidazol susp': { name: 'Metronidazol susp. 200 mg ', rule: w => 7.5, note: '7.5 mg/kg. Dividir em 3 tomadas', source: 'Protocolos clínicos da ITL', divideBy: 3 },
  'Ibuprofeno susp': { name: 'Ibuprofeno susp. 100 mg', rule: w => 20, note: '20 mg/kg. Dividir em 3 tomadas', source: 'Protocolos clínicos da ITL', divideBy: 3 },
  'Cotrimoxazol susp': { name: 'Cotrimoxazol susp 240 mg ', rule: w => 20, note: '20 mg/kg. Dividir em 2 tomadas, para criancas maiores de 2 meses.', source: 'Protocolos clínicos da ITL', divideBy: 2 },
  'Azitromicina susp': { name: 'Azitromicina susp 200 mg ', rule: w => 20, note: '10 mg/kg. Dividir em 1 tomadas ou DU.', source: 'Protocolos clínicos da ITL', divideBy: 1 },
  'Eritromicina susp': { name: 'Eritromicina, susp 250 mg ', rule: w => 30, note: '30 mg/kg. Dividir em 4 tomadas. Outro constante é 50 mg.', source: 'Protocolos clínicos da ITL', divideBy: 4 },
};

const drugSelect = document.getElementById('drug-select');
const drugWeight = document.getElementById('drug-weight');
function formatNumber(num) {
  return num.toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function updateDrugCalc() {
  const key = drugSelect.value;
  const w = parseFloat(drugWeight.value) || 0;
  const drug = DRUGS[key];
  const constant = drug.rule(w);
  const total = w * constant;

  document.getElementById('drug-constant').textContent = isFinite(constant)
    ? formatNumber(constant) + ' mg/kg'
    : '—';

  document.getElementById('drug-total').textContent = isFinite(total)
    ? formatNumber(total) + ' mg'
    : '—';

  document.getElementById('drug-per-dose').textContent = (drug.divideBy && isFinite(total))
    ? formatNumber(total / drug.divideBy) + ' mg'
    : '—';

  const detail = [];
  detail.push('Explicação: ' + drug.name);
  detail.push('Constante: ' + drug.note + ' (fonte: ' + drug.source + ')');
  detail.push('Peso: ' + w + ' kg');
  detail.push('Cálculo: ' + w + ' × ' + formatNumber(constant) + ' = ' + (isFinite(total) ? formatNumber(total) : '—') + ' mg');
  if (drug.divideBy && isFinite(total))
    detail.push('Divisão: ' + drug.divideBy + ' tomadas: ' + formatNumber(total / drug.divideBy) + ' mg por toma.');
  detail.push('Observação: confirmar os esquemas posológicos locais.');
  document.getElementById('drug-detail').textContent = detail.join('\n');
}
drugSelect.addEventListener('change', updateDrugCalc);
drugWeight.addEventListener('input', updateDrugCalc);
updateDrugCalc();
const pageUrl = encodeURIComponent(window.location.href);
const pageTitle = encodeURIComponent(document.title);
