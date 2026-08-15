// REFERENCIAS BIBLIOGRAFICAS
const acc = document.querySelector(".referencia");
const panel = document.querySelector(".panel");

acc.addEventListener("click", function () {
  this.classList.toggle("active");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
});



// MENSAGENS RECENTES
fetch('/recentes/index.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('posts-recentes').innerHTML = html;
  })
  .catch(err => console.error('Erro ao carregar posts recentes:', err));