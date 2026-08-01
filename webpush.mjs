import { notifyNewArticles } from "./scripts/push-notify.mjs";
await notifyNewArticles([{
    title: "Hábitos para dormir melhor: ter um sono mais profundo e reparador",
    url: "https://observacaoclinica.com/saude-mental/habitos-para-dormir-melhor/",
    image: "https://observacaoclinica.com/img/habitos-de-dormir.webp"
}]);