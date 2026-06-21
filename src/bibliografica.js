// REFERENCIAS BIBLIOGRAFICAS
const acc = document.querySelector(".referencia");
const panel = document.querySelector(".panel");

acc.addEventListener("click", function () {
  this.classList.toggle("active");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
});