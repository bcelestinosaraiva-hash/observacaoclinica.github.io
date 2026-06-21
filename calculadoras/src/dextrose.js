document.getElementById('calcular').addEventListener('click', () => {
  const peso = parseFloat(document.getElementById('peso').value) || 0;

  const doseConstante = 5;   // mg/kg
  const constD5 = 0.9;       // D5
  const constD50 = 0.1;      // D50

  const prescricao = peso * doseConstante;
  const qD5 = prescricao * constD5;
  const qD50 = prescricao * constD50;

  document.getElementById('results').hidden = false;

  // SEM ARREDONDAR
  document.getElementById('prescricao').textContent = prescricao + ' ml';
  document.getElementById('qD5').textContent = qD5 + ' ml';
  document.getElementById('qD50').textContent = qD50 + ' ml';
});