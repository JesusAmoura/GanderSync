// =====================
// EFECTO DE CARGA SUAVE
// =====================
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// =====================
// NAVBAR Y FOOTER INTERACTIVOS
// =====================
const navbar = document.querySelector('.barra-navegacion');
const footer = document.querySelector('.footer');
let ultimoScroll = 0;
let scrollTimeout;

window.addEventListener('scroll', () => {
  const actualScroll = window.scrollY;

  // --- NAVBAR ---
  if (actualScroll > ultimoScroll && actualScroll > 100) {
    navbar.classList.add('oculta');
    navbar.classList.remove('transparente');
  } else if (actualScroll < ultimoScroll) {
    navbar.classList.remove('oculta');
    navbar.classList.add('transparente');

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      navbar.classList.remove('transparente');
    }, 300);
  }

  ultimoScroll = actualScroll <= 0 ? 0 : actualScroll;

  // --- FOOTER ---
  const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
  if (window.scrollY >= scrollMax - 5) {
    footer.classList.add('visible');
  } else {
    footer.classList.remove('visible');
  }
});
