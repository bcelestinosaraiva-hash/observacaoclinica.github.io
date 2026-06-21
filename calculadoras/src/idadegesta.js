
const dumEl = document.getElementById('dum');
const apresentacaoEl = document.getElementById('apresentacao');
const cycleEl = document.getElementById('cycle');
const calcBtn = document.getElementById('calcBtn');
const clearBtn = document.getElementById('clearBtn');
const alertEl = document.getElementById('alert');
const resultCard = document.getElementById('resultCard');
const gestAgeEl = document.getElementById('gestAge');
const totalDaysEl = document.getElementById('totalDays');
const dppEl = document.getElementById('dpp');
const trimesterEl = document.getElementById('trimester');
const detailsEl = document.getElementById('details');

function showAlert(msg, type = 'error') {
  alertEl.classList.remove('hidden');
  alertEl.textContent = msg;
  if (type === 'error') {
    alertEl.classList.add('bg-gray-200', 'text-gray-900');
    alertEl.classList.remove('bg-yellow-100', 'text-yellow-800', 'bg-green-100', 'text-green-700');
  } else if (type === 'warn') {
    alertEl.classList.add('bg-yellow-100', 'text-yellow-800');
    alertEl.classList.remove('bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');
  } else {
    alertEl.classList.add('bg-green-100', 'text-green-700');
    alertEl.classList.remove('bg-red-100', 'text-red-700', 'bg-yellow-100', 'text-yellow-800');
  }
}

function hideAlert() {
  alertEl.classList.add('hidden');
  alertEl.textContent = '';
  alertEl.classList.remove('bg-red-100', 'text-red-700', 'bg-yellow-100', 'text-yellow-800', 'bg-green-100', 'text-green-700');
}

function clearAll() {
  dumEl.value = '';
  apresentacaoEl.value = '';
  cycleEl.value = '28';
  hideAlert();
  resultCard.classList.add('hidden');
}

function parseDateInput(value) {
  // returns Date in local time (midnight)
  if (!value) return null;
  const d = new Date(value + 'T00:00:00');
  return isNaN(d) ? null : d;
}

function formatDateBR(d) {
  return d.toLocaleDateString('pt-BR');
}

function calculate() {
  hideAlert();
  resultCard.classList.add('hidden');

  const dumStr = dumEl.value;
  const apStr = apresentacaoEl.value;
  if (!dumStr) { showAlert('Por favor informe a DUM (data da última menstruação).', 'error'); return; }
  if (!apStr) { showAlert('Por favor informe a data de apresentação na unidade sanitária.', 'error'); return; }

  const dum = parseDateInput(dumStr);
  const ap = parseDateInput(apStr);
  if (!dum || !ap) { showAlert('Datas inválidas. Verifique o formato.', 'error'); return; }

  // Se a DUM for posterior à data de apresentação -> alerta
  if (dum > ap) {
    showAlert('A DUM é posterior à data de apresentação. Verifique as datas.', 'error');
    return;
  }

  // diferença em ms -> dias (arredondar para baixo)
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = ap.getTime() - dum.getTime();
  const diffDays = Math.floor(diffMs / msPerDay);

  const semanas = Math.floor(diffDays / 7);
  const dias = diffDays % 7;

  // DPP base: DUM + 280 dias
  const cycle = Number(cycleEl.value) || 28;
  // ajustar DPP por diferença de ciclo (cycle - 28) dias
  const adjust = cycle - 28;

  const dppDate = new Date(dum.getTime());
  dppDate.setDate(dppDate.getDate() + 280 + adjust);

  // determinar trimestre
  let trimester = 'Desconhecido';
  if (semanas < 14) trimester = '1º trimestre';
  else if (semanas < 28) trimester = '2º trimestre';
  else trimester = '3º trimestre';

  // Montar saída
  gestAgeEl.textContent = `${semanas} semanas e ${dias} dias`;
  totalDaysEl.textContent = `${diffDays} dias`;
  dppEl.textContent = `${formatDateBR(dppDate)} ${adjust !== 0 ? `(ajustada por ciclo ${cycle}d)` : ''}`;
  trimesterEl.textContent = trimester;

  // Detalhes (explicativos)
  const details = [];
  details.push(`DUM: ${formatDateBR(dum)}`);
  details.push(`Data de apresentação: ${formatDateBR(ap)}`);
  details.push(`Cálculo: diferença em dias = ${diffDays} dias → ${semanas} sem. + ${dias} dias`);
  details.push(`DPP (Näegele, 280 dias): ${formatDateBR(new Date(dum.getTime() + 280 * msPerDay))}`);
  if (adjust !== 0) details.push(`Ajuste por ciclo (${cycle} dias): ${adjust > 0 ? '+' + adjust : adjust} dias → DPP ajustada = ${formatDateBR(dppDate)}`);
  details.push(`Trimestre estimado: ${trimester}`);
  details.push('');
  resultCard.classList.remove('hidden');
}
// Event listeners
calcBtn.addEventListener('click', calculate);
clearBtn.addEventListener('click', clearAll);
// Permitir Enter para calcular quando dentro dos campos
[dumEl, apresentacaoEl, cycleEl].forEach(el => {
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      calculate();
    }
  });
});