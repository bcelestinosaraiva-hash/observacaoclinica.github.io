const fs = require("fs");
const baseUrl = "https://www.observacaoclinica.com";
// LISTA DOS TEUS ARTIGOS URLs
const urls = [
  "/",
  "/nutricao/",
  "/gravidez/",
  "/saude-az/",
  "/bem-estar/",
  "/calculadoras/",
  "/equipa/",
  "/equipa/beldo-celestino-saraiva.html",
  "/gravidez/sintomas-de-gravidez-como-identificar-os-primeiros-sinais-com-seguranca.html",
  "/bem-estar/importancia-da-prevencao-de-carie-dentaria.html",
  "/bem-estar/treino-para-ganhar-massa-muscular.html",
  "/calculadoras/como-calcular-a-diluicao.html",
  "/calculadoras/como-calcular-dextrose.html",
  "/calculadoras/como-calcular-indice-de-massa-corporal.html",
  "/calculadoras/como-calcular-o-ciclo-menstrual.html",
  "/calculadoras/constantes-usadas-de-medicamentos.html",
  "/calculadoras/idade-gestacional.html",
  "/equipa/beldo-celestino-saraiva.html",
  "/nutricao/aleitamento-materno-sua-importancia-e-beneficios.html",
  "/nutricao/alimentos-para-os-idosos.html",
  "/nutricao/as-necessidades-nutricionais-das-criancas.html",
  "/nutricao/como-tratar-diabetes.html",
  "/nutricao/dieta-para-uma-pessoa-hipertensa.html",
  "/nutricao/introducao-de-alimentos-aos-seus-6-meses-de-idades.html",
  "/saude-az/7-sintomas-de-meningite-que-parecem-gripe.html",
  "/saude-az/ansiedade-sintomas-causas-e-como-controlar-de-forma-e-eficaz.html",
  "/saude-az/asma-sintomas-tratamento.html",
  "/saude-az/como-se-prevenir-da-malaria.html",
  "/saude-az/doencas-respiratorias.html",
  "/saude-az/hipertensao-arterial-mas-porque.html",
  "/saude-az/o-que-e-avc.html",
  "/saude-az/o-que-e-bronquiolite.html",
  "/saude-az/o-que-e-bronquite-e-como-prevenir.html",
  "/saude-az/o-que-e-candidiase-vaginal.html",
  "/saude-az/o-que-e-clotrimazol-creme-vaginal.html",
  "/saude-az/o-que-e-ebola-e-sua-prevencao.html",
  "/saude-az/o-que-e-pneumonia.html",
  "/saude-az/o-que-e-sinusite.html",
  "/saude-az/o-que-e-tuberculose.html",
  "/saude-az/o-tratamento-da-pneumonia.html",
  "/saude-az/os-temas-sobre-saude-intima.html",
  "/saude-az/os-temas-sobre-saude-mental.html",
  "/saude-az/o-que-e-ebola-e-sua-prevencao.html",
];

// gerar sitemap
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

urls.forEach(url => {
  sitemap += `
  <url>
    <loc>${baseUrl + url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
});
sitemap += `\n</urlset>`;
// guardar ficheiro
fs.writeFileSync("sitemap.xml", sitemap);
console.log("✔ Sitemap criado com sucesso!");
// code para rodar o meu sitemap: node