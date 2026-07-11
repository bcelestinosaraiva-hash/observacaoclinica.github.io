// Diluição
const nursePresc = document.getElementById('nurse-presc');
const nurseDil = document.getElementById('nurse-dilution');
const nurseConc = document.getElementById('nurse-conc');
const nurseMl = document.getElementById('nurse-ml');
const nurseDetail = document.getElementById('nurse-detail');
const nurseBtn = document.getElementById('calcular-nurse');

function formatResult(v) { return Number.isInteger(v) ? String(v) : v.toFixed(2); }

function updateNurse() {
  const presc = parseFloat(nursePresc.value);
  const dil = parseFloat(nurseDil.value);
  const conc = parseFloat(nurseConc.value);

  if (!Number.isFinite(presc) || !Number.isFinite(dil) || !Number.isFinite(conc) || conc === 0) {
    nurseMl.textContent = 'mL';
    nurseDetail.textContent = '⚠️ Preencha todos os campos correctamente (os campos não podem ser 0)';
    nurseDetail.classList.add('aviso');
    return;
  }

  const resultado = (presc * dil) / conc;
  nurseMl.textContent = `${formatResult(resultado)} mL`;
  nurseDetail.textContent = `Cálculo: (${presc} × ${dil}) ÷ ${conc}`;
  nurseDetail.classList.remove('aviso');
}

// só calcula quando o botão é clicado — nada aparece antes disso
nurseBtn.addEventListener('click', updateNurse);