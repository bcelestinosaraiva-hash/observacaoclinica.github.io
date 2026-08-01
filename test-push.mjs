import { notifyNewArticles } from "./scripts/push-notify.mjs";
await notifyNewArticles([{
    title: "Artigo de teste",
    url: "https://observacaoclinica.com/",
    image: "https://observacaoclinica.com/img/logo.webp"
}]);