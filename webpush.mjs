import { notifyNewArticles } from "./scripts/push-notify.mjs";
await notifyNewArticles([{
    title: "Como escovar os dentes corretamente: passo a passo completo",
    url: "https://observacaoclinica.com//saude-bucal/como-escovar-os-dentes-corretamente/",
    image: "https://observacaoclinica.com/img/como-escovar-corretamente-1200.webp"
}]);