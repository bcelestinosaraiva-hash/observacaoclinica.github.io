import { notifyNewArticles } from "./scripts/push-notify.mjs";
await notifyNewArticles([{
    title: "Posso comer ovo todos os dias? Benefícios e cuidados",
    url: "https://observacaoclinica.com/nutricao/posso-comer-ovo-todos-os-dias/",
    image: "https://observacaoclinica.com/img/ovos-cozidos.webp"
}]);