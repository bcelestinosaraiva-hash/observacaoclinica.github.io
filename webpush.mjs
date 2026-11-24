import { notifyNewArticles } from "./scripts/push-notify.mjs";
await notifyNewArticles([{
    title: "Como tratar a água em casa para prevenir a cólera",
    url: "https://observacaoclinica.com/saude-az/como-tratar-agua-em-casa-prevenir-colera/",
    image: "https://observacaoclinica.com/img/como-tratar-agua-1200.webp"
}]);