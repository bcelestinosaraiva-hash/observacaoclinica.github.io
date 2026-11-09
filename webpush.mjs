import { notifyNewArticles } from "./scripts/push-notify.mjs";
await notifyNewArticles([{
    title: "Como dormir rápido: hábitos que ajudam a pegar no sono",
    url: "https://observacaoclinica.com/sono/como-dormir-rapido/",
    image: "https://observacaoclinica.com/img/como-dormir-rapido-1200.webp"
}]);