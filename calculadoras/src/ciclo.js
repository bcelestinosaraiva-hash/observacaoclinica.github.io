// preencher selects
for (let i = 3; i <= 8; i++) {
  document.getElementById("duracao").innerHTML += `<option>${i} dias</option>`;
}

for (let i = 28; i <= 45; i++) {
  document.getElementById("ciclo").innerHTML += `<option>${i} dias</option>`;
}

function formatar(data) {
  return data.toLocaleDateString('pt-BR');
}

function calcular() {
  let data = document.getElementById("data").value;
  let duracao = parseInt(document.getElementById("duracao").value);
  let ciclo = parseInt(document.getElementById("ciclo").value);

  if (!data) {
    alert("Selecione a data");
    return;
  }

  let inicio = new Date(data);
  let proxima = new Date(inicio);
  proxima.setDate(proxima.getDate() + ciclo);

  let fim = new Date(proxima);
  fim.setDate(fim.getDate() + duracao - 1);

  let resultado = document.getElementById("resultado");
  resultado.style.display = "block";

  resultado.innerHTML = `
    <h3>🩸 SUA PRÓXIMA MENSTRUAÇÃO DEVE VIR ENTRE:</h3>
    <p><strong>${formatar(proxima)} até ${formatar(fim)}</strong></p>

    <div class="calendar">
      <div class="calendar-header">
        <span>${proxima.toLocaleString('pt-PT', { month: 'long' })} ${proxima.getFullYear()}</span>
      </div>
      <div class="days" id="dias"></div>
    </div>
  `;

  gerarCalendario(proxima, duracao);
}

function gerarCalendario(dataInicio, duracao) {
  let diasDiv = document.getElementById("dias");
  diasDiv.innerHTML = "";

  let ano = dataInicio.getFullYear();
  let mes = dataInicio.getMonth();

  let diasMes = new Date(ano, mes + 1, 0).getDate();

  for (let dia = 1; dia <= diasMes; dia++) {
    let classe = "";

    for (let i = 0; i < duracao; i++) {
      let d = new Date(dataInicio);
      d.setDate(d.getDate() + i);

      if (d.getDate() === dia) {
        classe = "menstrual";
      }
    }

    diasDiv.innerHTML += `<div class="day ${classe}">${dia}</div>`;
  }
}