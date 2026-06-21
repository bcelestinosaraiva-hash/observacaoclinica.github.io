// Diluição
const nursePresc = document.getElementById('nurse-presc');
const nurseDil = document.getElementById('nurse-dilution');
const nurseConc = document.getElementById('nurse-conc');
const nurseMl = document.getElementById('nurse-ml');
const nurseDetail = document.getElementById('nurse-detail');
const nurseBtn = document.getElementById('calcular-nurse');

function formatResult(v) { return Number.isInteger(v) ? String(v) : v.toFixed(2); }
function updateNurse(showErrors = false) {
  const presc = parseFloat(nursePresc.value);
  const dil = parseFloat(nurseDil.value);
  const conc = parseFloat(nurseConc.value);
  if (!Number.isFinite(presc) || !Number.isFinite(dil) || !Number.isFinite(conc) || conc === 0) {
    nurseMl.textContent = 'mL';
    nurseDetail.textContent = showErrors ? "⚠️ Preencha todos os campos correctamente (os campos não pode ser 0)" : '';
    return;
  }
  const resultado = (presc * dil) / conc;
  nurseMl.textContent = `${formatResult(resultado)} mL`;
  nurseDetail.textContent = `Cálculo: (${presc} × ${dil}) ÷ ${conc}`;
}
nursePresc.addEventListener('input', updateNurse);
nurseDil.addEventListener('input', updateNurse);
nurseConc.addEventListener('input', updateNurse);
nurseBtn.addEventListener('click', () => updateNurse(true));