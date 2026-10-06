(function () {
  var $ = function (i) { return document.getElementById(i); };

  // Ajuste conforme o protocolo da sua instituição (mL de D10%)
  var ADULTO = { min: 150, max: 200 };
  var MAX_ML = 250;

  function f(n) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  // Formata um valor ou uma faixa (a – b)
  function val(a, b, un) {
    return b === undefined ? f(a) + ' ' + un : f(a) + ' – ' + f(b) + ' ' + un;
  }

  function linha(rotulo, valor) {
    return '<div class="row"><span>' + rotulo + '</span><b>' + valor + '</b></div>';
  }

  function tabela(a, b) {
    var t = function (x) { return b === undefined ? undefined : x(b); };
    return linha('Volume de D10%', val(a, b, 'mL')) +
      linha('Glicose administrada', val(a * 0.1, t(function (x) { return x * 0.1; }), 'g')) +
      linha('Se preparar com D50% (1 parte)', val(a / 9, t(function (x) { return x / 9; }), 'mL')) +
      linha('Se preparar com D5% (8 partes)', val(a * 8 / 9, t(function (x) { return x * 8 / 9; }), 'mL'));
  }

  function alternar() {
    var adulto = $('grupo').value === 'adulto';
    $('bloco-peso').style.display = adulto ? 'none' : '';
    $('res').innerHTML = '';
  }

  function calc() {
    var r = $('res'), out;

    if ($('grupo').value === 'adulto') {
      out = tabela(ADULTO.min, ADULTO.max) +
        '<p class="nota">Adulto: volume fixo, independente do peso. Administrar em bolus conforme protocolo e reavaliar a glicemia.</p>';
    } else {
      var w = parseFloat($('peso').value.replace(',', '.')),
        d = parseFloat($('grupo').value);

      if (!(w >= 0.3) || w > 150) {
        r.innerHTML = '<p class="err">Informe um peso válido, entre 0,3 e 150 kg.</p>';
        return;
      }

      var v = w * d, cap = false;
      if (v > MAX_ML) { v = MAX_ML; cap = true; }

      out = tabela(v);
      if (cap) out += '<p class="err">Volume limitado ao máximo de ' + MAX_ML + ' mL (25 g). Confira o protocolo.</p>';
      if (w >= 50) out += '<p class="err">Peso elevado: considere usar a faixa "Adulto" (volume fixo de protocolo).</p>';
    }

    out += '<p class="nota">Apoio educativo. Confira com a prescrição e o protocolo da instituição.</p>';
    r.innerHTML = out;
  }

  $('grupo').addEventListener('change', alternar);
  $('btn').addEventListener('click', calc);
  $('peso').addEventListener('keydown', function (e) { if (e.key === 'Enter') calc(); });
  alternar();
})();