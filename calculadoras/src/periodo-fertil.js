const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
];
function formatar(data) {
    return data.toLocaleDateString('pt-PT');
}
function calcular() {
    let dataValor =
        document.getElementById("data").value;
    if (!dataValor) {
        alert("Selecione a data da última menstruação.");
        return;
    }
    let ciclo =
        parseInt(document.getElementById("ciclo").value);
    let ultima =
        new Date(dataValor + "T00:00:00");
    let ovulacao =
        new Date(ultima);
    ovulacao.setDate(
        ovulacao.getDate() + (ciclo - 14)
    );
    let inicioFertil =
        new Date(ovulacao);
    inicioFertil.setDate(
        inicioFertil.getDate() - 3
    );
    let fimFertil =
        new Date(ovulacao);
    fimFertil.setDate(
        fimFertil.getDate() + 3
    );
    let proxima =
        new Date(ultima);
    proxima.setDate(
        proxima.getDate() + ciclo
    );
    let parto =
        new Date(ultima);
    parto.setDate(
        parto.getDate() + 280
    );
    document.getElementById("resultado").style.display = "block";
    document.getElementById("tituloResultado").innerHTML =
        `O SEU PERÍODO FÉRTIL SERÁ DE ${inicioFertil.getDate()} A ${fimFertil.getDate()}  DE ${meses[fimFertil.getMonth()].toUpperCase()}.`;
    document.getElementById("textoResultado").innerHTML =
        `
A sua próxima menstruação está prevista para o dia
<b>${formatar(proxima)}</b>.<br><br>
Se engravidar neste período a data prevista para o nascimento do bebê será:
<b>${formatar(parto)}</b>.
`;
    gerarCalendario(
        inicioFertil,
        fimFertil,
        ovulacao
    );
}
function gerarCalendario(
    inicioFertil,
    fimFertil,
    ovulacao
) {
    let mes = inicioFertil.getMonth();
    let ano = inicioFertil.getFullYear();
    document.getElementById("mesAno").innerHTML =
        `${meses[mes]} ${ano}`;
    let primeiroDia =
        new Date(ano, mes, 1);
    let ultimoDia =
        new Date(ano, mes + 1, 0);
    let html = `
<tr>
<th>Seg</th>
<th>Ter</th>
<th>Qua</th>
<th>Qui</th>
<th>Sex</th>
<th>Sáb</th>
<th>Dom</th>
</tr>
`;
    let inicioSemana =
        (primeiroDia.getDay() + 6) % 7;
    html += "<tr>";
    for (let i = 0; i < inicioSemana; i++) {
        html += "<td></td>";
    }
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        let atual =
            new Date(ano, mes, dia);
        let classe = "";
        if (
            atual >= inicioFertil &&
            atual <= fimFertil
        ) {
            classe = "fertil";
        }
        if (
            atual.toDateString() ===
            ovulacao.toDateString()
        ) {
            classe = "ovulacao";
        }
        html += `<td class="${classe}">${dia}</td>`;
        if (
            (atual.getDay() + 6) % 7 === 6 &&
            dia !== ultimoDia.getDate()
        ) {
            html += "</tr><tr>";
        }
    }
    html += "</tr>";
    document.getElementById("calendario").innerHTML =
        html;
}