// =====================
// SLIDER DE IMÁGENES
// =====================
let index = 0;
// Asegúrate de que tu contenedor de imágenes tenga el id="galeria"
const imagenes = document.querySelectorAll('.imagenes img');
const total = imagenes.length;

function mostrarSiguienteImagen() {
    // Si no hay imágenes, no hacemos nada
    if (total === 0) return;

    // Quitar la clase activa de la imagen actual
    if (imagenes[index]) {
        imagenes[index].classList.remove('img-activa');
    }
    
    // Calcular el siguiente índice
    index = (index + 1) % total;
    
    // Poner la clase activa a la nueva imagen
    if (imagenes[index]) {
        imagenes[index].classList.add('img-activa');
    }
}

// Inicializar la primera imagen como activa al cargar
window.addEventListener("load", () => {
    if (total > 0) {
        imagenes[index].classList.add('img-activa');
    }
});

// Cambiar imagen cada 4 segundos
setInterval(mostrarSiguienteImagen, 4000);

// =====================
// EFECTO DE CARGA
// =====================
window.addEventListener("load", () => {
    document.body.classList.add("loaded");
});

// =====================
// NAVBAR Y FOOTER INTERACTIVOS
// =====================
// ✅ Se declaran las variables al inicio
const navbar = document.querySelector('.barra-navegacion');
const footer = document.querySelector('.footer');
let ultimoScroll = 0;
let scrollTimeout;

window.addEventListener('scroll', () => {
    const actualScroll = window.scrollY;

    // --- LÓGICA DE NAVBAR ---
    
    // Bajar → ocultar navbar
    if (actualScroll > ultimoScroll && actualScroll > 100) {
        navbar.classList.add('oculta');
        navbar.classList.remove('transparente');
    }
    // Subir → mostrar navbar transparente
    else if (actualScroll < ultimoScroll) {
        navbar.classList.remove('oculta');
        navbar.classList.add('transparente');

        // Después de 0.3s sin scroll, vuelve al estado normal (sin transparencia)
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            navbar.classList.remove('transparente');
        }, 300);
    }
    
    // ✅ Regla para asegurar que al estar arriba del todo, no sea transparente ni esté oculta
    if (actualScroll <= 0) {
        navbar.classList.remove('oculta');
        navbar.classList.remove('transparente');
    }

    ultimoScroll = actualScroll <= 0 ? 0 : actualScroll;

    // --- LÓGICA DE FOOTER ---
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;

    if (window.scrollY >= scrollMax - 5) { // -5 para margen de seguridad
        footer.classList.add('visible');
    } else {
        footer.classList.remove('visible');
    }
});