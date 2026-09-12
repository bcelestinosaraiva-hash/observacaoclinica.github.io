import { notifyNewArticles } from "./scripts/push-notify.mjs";
await notifyNewArticles([{
    title: "O que comer antes e depois do treino: Guia completo",
    url: "https://observacaoclinica.com//br/nutricao/o-que-comer-antes-e-depois-do-treino/",
    image: "https://observacaoclinica.com/img/alimentos-no-treino-1200.webp"
}]);