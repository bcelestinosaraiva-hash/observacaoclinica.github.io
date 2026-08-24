import { notifyNewArticles } from "./scripts/push-notify.mjs";
await notifyNewArticles([{
    title: "Observação clínica: o que é, para que serve e como é feita",
    url: "https://observacaoclinica.com/saude-az/observacao-clinica-o-que-e/",
    image: "https://observacaoclinica.com/img/observacao-clinica-o-que-e-748.webp"
}]);