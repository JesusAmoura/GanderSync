// ===================================
// VARIABLES GLOBALES Y ELEMENTOS DOM
// ===================================
const body = document.getElementById("body");
const navbar = document.querySelector(".barra-navegacion");
const footer = document.querySelector(".footer");

// Elementos de Modales de Alerta/Confirmación
const alertModal = document.getElementById("alertModal");
const alertMessage = document.getElementById("alertMessage");
const alertCloseBtn = document.getElementById("alertCloseBtn");
const confirmModal = document.getElementById("confirmModal");
const confirmMessage = document.getElementById("confirmMessage");
const confirmOkBtn = document.getElementById("confirmOkBtn");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");

// Elementos de Accesibilidad 
const floatingAccessibilityBtn = document.getElementById("floatingAccessibilityBtn");
const accessibilitySidebar = document.getElementById("accessibility-sidebar");
const closeAccessibility = document.getElementById("closeAccessibility");
const toggleContrastBtn = document.getElementById("toggleContrastBtn");
const increaseTextBtn = document.getElementById("increaseTextBtn");
const decreaseTextBtn = document.getElementById("decreaseTextBtn");

// Constantes de Accesibilidad
const FONT_SCALE_STEP = 0.1;
const FONT_SCALE_MAX = 1.5;
const FONT_SCALE_MIN = 0.8;

let ultimoScroll = 0;
let scrollTimeout;

// ===================================
// FUNCIONES DE UTILIDAD Y ACCESIBILIDAD
// ===================================

function handleEnterKey(element, callback) {
    if (element) {
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                callback(e);
            }
        });
    }
}

function showAlert(message) {
    return new Promise((resolve) => {
        if (alertMessage && alertModal && alertCloseBtn) {
            alertMessage.textContent = message;
            alertModal.classList.remove("hidden");
            alertModal.removeAttribute("hidden"); 
            alertCloseBtn.focus(); 

            const closeListener = (e) => {
                if (e.type === 'click' || (e.type === 'keydown' && e.key === 'Enter')) {
                    e.preventDefault();
                    alertModal.classList.add("hidden");
                    alertModal.setAttribute("hidden", "true");
                    alertCloseBtn.removeEventListener("click", closeListener);
                    alertCloseBtn.removeEventListener("keydown", closeListener);
                    resolve(); 
                }
            };

            alertCloseBtn.addEventListener("click", closeListener);
            handleEnterKey(alertCloseBtn, closeListener);
        } else {
            console.error("No se encontró el modal de alerta.");
            resolve(); 
        }
    });
}

function showConfirm(message) {
    return new Promise((resolve) => {
        if (!confirmMessage || !confirmModal || !confirmOkBtn || !confirmCancelBtn) {
            console.error("No se encontró el modal de confirmación.");
            resolve(false);
            return;
        }

        confirmMessage.textContent = message;
        confirmModal.classList.remove("hidden");
        confirmModal.removeAttribute("hidden"); 
        confirmOkBtn.focus();

        const listener = (e, value) => {
            if (e.type === 'click' || (e.type === 'keydown' && e.key === 'Enter')) {
                e.preventDefault();
                confirmModal.classList.add("hidden");
                confirmModal.setAttribute("hidden", "true");
                resolve(value); 
                cleanup();
            }
        };

        const okListener = (e) => listener(e, true);
        const cancelListener = (e) => listener(e, false);

        const cleanup = () => {
            confirmOkBtn.removeEventListener("click", okListener);
            handleEnterKey(confirmOkBtn, okListener);
            confirmCancelBtn.removeEventListener("click", cancelListener);
            handleEnterKey(confirmCancelBtn, cancelListener);
        };

        confirmOkBtn.addEventListener("click", okListener);
        handleEnterKey(confirmOkBtn, okListener);
        confirmCancelBtn.addEventListener("click", cancelListener);
        handleEnterKey(confirmCancelBtn, cancelListener);
    });
}


function toggleAccessibilitySidebar() {
    const isOpen = accessibilitySidebar?.classList.toggle("open");
    if (accessibilitySidebar) {
        // Toggle hidden state for screen readers
        accessibilitySidebar.toggleAttribute('hidden', !isOpen);
        floatingAccessibilityBtn.setAttribute('aria-expanded', isOpen);
    }
}

function toggleContrast() {
    const isHighContrast = body?.classList.toggle("high-contrast");
    toggleContrastBtn.textContent = isHighContrast ? "Alto Contraste: ACTIVADO" : "Alto Contraste: DESACTIVADO";
}

function changeFontSize(direction) {
    const root = document.documentElement;
    let currentScale = parseFloat(root.style.getPropertyValue('--font-scale')) || 1.0;

    if (direction === 'increase' && currentScale < FONT_SCALE_MAX) {
        currentScale = Math.min(FONT_SCALE_MAX, currentScale + FONT_SCALE_STEP);
    } else if (direction === 'decrease' && currentScale > FONT_SCALE_MIN) {
        currentScale = Math.max(FONT_SCALE_MIN, currentScale - FONT_SCALE_STEP);
    } else if (direction === 'reset') {
        currentScale = 1.0;
    }

    root.style.setProperty('--font-scale', currentScale.toFixed(2));
}

// Event Listeners de Accesibilidad
if (floatingAccessibilityBtn) {
    floatingAccessibilityBtn.addEventListener("click", toggleAccessibilitySidebar);
    handleEnterKey(floatingAccessibilityBtn, toggleAccessibilitySidebar);
}
if (closeAccessibility) {
    closeAccessibility.addEventListener("click", toggleAccessibilitySidebar);
    handleEnterKey(closeAccessibility, toggleAccessibilitySidebar);
}
if (toggleContrastBtn) {
    toggleContrastBtn.addEventListener("click", toggleContrast);
}
if (increaseTextBtn) {
    increaseTextBtn.addEventListener("click", () => changeFontSize('increase'));
}
if (decreaseTextBtn) {
    decreaseTextBtn.addEventListener("click", () => changeFontSize('decrease'));
}

// Control de cierre de accesibilidad al hacer click fuera
window.addEventListener("click", function (e) {
    if (accessibilitySidebar && accessibilitySidebar.classList.contains('open')) {
        // Solo cierra si no se hizo click dentro del sidebar ni en el botón flotante
        if (!e.target.closest('.accessibility-sidebar') && e.target !== floatingAccessibilityBtn) {
            toggleAccessibilitySidebar(); 
        }
    }
});

// ===================================
// SLIDER DE IMÁGENES
// ===================================
let index = 0;
const imagenes = document.querySelectorAll('.imagenes img');
const total = imagenes.length;

function mostrarSiguienteImagen() {
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

// Cambiar imagen cada 4 segundos
if (total > 1) {
    setInterval(mostrarSiguienteImagen, 4000);
}

// ===================================
// ANIMACIÓN DE NAVBAR Y FOOTER
// ===================================
const scrollThreshold = 80;

window.addEventListener('scroll', () => {
    const actualScroll = window.scrollY || document.documentElement.scrollTop;

    // Detener si los modales o el sidebar están abiertos
    if (
      (alertModal && !alertModal.classList.contains("hidden")) ||
      (confirmModal && !confirmModal.classList.contains("hidden")) ||
      (accessibilitySidebar && accessibilitySidebar.classList.contains("open"))
    )
      return;

    // --- LÓGICA DE NAVBAR ---
    if (actualScroll > ultimoScroll && actualScroll > scrollThreshold) {
        navbar?.classList.add('oculta');
        navbar?.classList.remove('transparente');
    } else if (actualScroll < ultimoScroll) {
        navbar?.classList.remove('oculta');
        navbar?.classList.add('transparente');

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            navbar?.classList.remove('transparente');
        }, 300);
    }
    
    if (actualScroll <= 0) {
        navbar?.classList.remove('oculta');
        navbar?.classList.remove('transparente');
    }

    ultimoScroll = Math.max(actualScroll, 0);

    // --- LÓGICA DE FOOTER (Ya no es fixed, solo se maneja la visibilidad con scroll) ---
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;

    // NOTA: La lógica de 'visible' del footer solo aplica si el footer es fijo. 
    // Como ahora el footer está al final del contenido, esta lógica se remueve 
    // del JS o se deja inactiva, pero mantengo la estructura por si se revierte el CSS.
    if (window.scrollY >= scrollMax - 5) {
        // footer?.classList.add('visible'); // Comentado o inactivo si el footer no es fijo
    } else {
        // footer?.classList.remove('visible'); // Comentado o inactivo si el footer no es fijo
    }
}, { passive: true });


// ===================================
// INICIALIZACIÓN
// ===================================
window.addEventListener("load", () => {
    // 1. Efecto de carga
    document.body.classList.add("loaded");
    document.documentElement.style.setProperty('--font-scale', '1.0'); 

    // 2. Inicializar la primera imagen del slider
    if (total > 0) {
        imagenes[index].classList.add('img-activa');
    }
});