import { notifyNewArticles } from "./scripts/push-notify.mjs";
await notifyNewArticles([{
    title: "",
    url: "https://observacaoclinica.com/saude-az/glossario-clinico/",
    image: "https://observacaoclinica.com/img/glossario-1200.webp"
}]);