let sexoSelecionado = 'Mulher';
const btnMulher = document.getElementById('sexo-mulher');
const btnHomem = document.getElementById('sexo-homem');
const calcularBtn = document.getElementById('calcular');
const resultadoDiv = document.getElementById('resultado');

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

calcularBtn.addEventListener('click', () => {
  const idade = parseInt(document.getElementById('idade').value);
  const altura = parseFloat(document.getElementById('altura').value) / 100;
  const peso = parseFloat(document.getElementById('peso').value);
  if (!idade || !altura || !peso) {
    resultadoDiv.innerHTML = `<div class="bg-gray-100 border border-gray-200 text-gray-800 p-2 py-2 rounded">Preencha todos os campos necessário!</div>`;
    return;
  }
  const imc = (peso / (altura * altura)).toFixed(1);
  let classificacao = "", cor = "";
  if (imc < 18.5) { classificacao = "Desnutrido"; cor = "text-blue-600"; }
  else if (imc < 25) { classificacao = "Normal"; cor = "text-green-600"; }
  else if (imc < 30) { classificacao = "Sobrepeso"; cor = "text-orange-500"; }
  else if (imc < 35) { classificacao = "Obesidade Grau I"; cor = "text-red-500"; }
  else if (imc < 40) { classificacao = "Obesidade Grau II"; cor = "text-red-600"; }
  else { classificacao = "Obesidade Grau III"; cor = "text-red-700"; }
  resultadoDiv.innerHTML = `<div class="bg-white rounded mt-4 space-y-6">
    <p class="text-xl ${cor}">O seu índice de massa corporal (IMC) é de: ${imc} kg/m²</p>
    <p class="text-gray-700 mt-1">Classificação: <span class="font-semibold">${classificacao}</span>.</p>
  </div>`;
});
