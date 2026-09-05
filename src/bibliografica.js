// REFERENCIAS BIBLIOGRAFICAS
const acc = document.querySelector(".referencia");
const panel = document.querySelector(".panel");

acc.addEventListener("click", function () {
  this.classList.toggle("active");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
});


// MENSAGENS RECENTES (várias pastas)
async function carregarPostsRecentes(url, elementId) {
  const el = document.getElementById(elementId);
  if (!el) return; // evita erro se o elemento não existir nessa página

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} ao buscar ${url}`);
    const html = await res.text();
    el.innerHTML = html;
  } catch (err) {
    console.error(`Erro ao carregar posts recentes (${url}):`, err);
    el.innerHTML = '<p>Não foi possível carregar os posts recentes.</p>';
  }
}

// Carrega ambos em paralelo, sem um bloquear o outro
Promise.all([
  carregarPostsRecentes('/recentes/index.html', 'posts-recentes'),
  carregarPostsRecentes('/br/recente/index.html', 'posts-recente')
]);