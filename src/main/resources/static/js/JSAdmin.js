// JSAdmin.js - Script Completo para la página de Administración

// ===================================
// VARIABLES GLOBALES DEL DOM
// ===================================

const body = document.getElementById("body") || document.body;

// Elementos de Modales de Alerta/Confirmación
const alertModal = document.getElementById("alertModal");
const alertMessage = document.getElementById("alertMessage");
const alertCloseBtn = document.getElementById("alertCloseBtn");
const confirmModal = document.getElementById("confirmModal");
const confirmMessage = document.getElementById("confirmMessage");
const confirmOkBtn = document.getElementById("confirmOkBtn");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");


// --- ELEMENTOS DE NAVBAR Y FOOTER (Copiado de JSOfertas) ---
const navbar = document.querySelector(".barra-navegacion");
const footer = document.querySelector(".footer");
const menuToggleBtn = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".menu"); // <nav class="menu">
const logoutLinks = document.querySelectorAll(".logout-btn, .logout-btn-mobile");
// En Admin.html, usamos la clase 'mobile-current-page' directamente dentro del nav
const currentPageMobileSpan = navMenu ? navMenu.querySelector(".mobile-current-page") : null; 
const navLinks = document.querySelectorAll(".menu a");
let ultimoScroll = 0;
let scrollTimeout;


// --- ELEMENTOS DE ACCESIBILIDAD (Copiado de JSOfertas) ---
const floatingAccessibilityBtn = document.getElementById("floatingAccessibilityBtn");
const accessibilityContainer = document.querySelector(".accessibility-container"); // Contenedor arrastrable
const accessibilityMenu = document.getElementById("accessibility-menu"); // Menú/Caja de controles
const toggleContrastBtn = document.getElementById("toggleContrastBtn");
const increaseTextBtn = document.getElementById("increaseTextBtn");
const decreaseTextBtn = document.getElementById("decreaseTextBtn");
const resetTextBtn = document.getElementById("resetTextBtn");

// Constantes de Accesibilidad
const FONT_SCALE_STEP = 0.1;
const FONT_SCALE_MAX = 1.5;
const FONT_SCALE_MIN = 0.8;
let isMenuClosingByScroll = false;
const isMobile = () => window.innerWidth <= 768;


// ===================================
// FUNCIONES DE UTILIDAD Y MODALES (Copiado de JSOfertas)
// ===================================

/**
 * Maneja la pulsación de la tecla Enter para simular un clic.
 */
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

/**
 * Muestra el modal de alerta y devuelve una Promesa que se resuelve al cerrarse.
 */
function showAlert(message) {
    return new Promise((resolve) => {
        if (alertMessage && alertModal && alertCloseBtn) {
            alertMessage.textContent = message;
            alertModal.classList.remove("hidden");
            alertModal.removeAttribute("hidden"); 
            alertModal.style.display = 'flex';
            
            alertCloseBtn.focus(); 

            const closeListener = (e) => {
                if (e.type === 'click' || (e.type === 'keydown' && e.key === 'Enter')) {
                    e.preventDefault();
                    alertModal.classList.add("hidden");
                    alertModal.setAttribute("hidden", "true");
                    alertModal.style.display = 'none';
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

/**
 * Muestra el modal de confirmación y devuelve una Promesa con el resultado.
 */
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
        confirmModal.style.display = 'flex';
        confirmOkBtn.focus();

        const listener = (e, value) => {
            if (e.type === 'click' || (e.type === 'keydown' && e.key === 'Enter')) {
                e.preventDefault();
                confirmModal.classList.add("hidden");
                confirmModal.setAttribute("hidden", "true");
                confirmModal.style.display = 'none';
                resolve(value); 
                cleanup();
            }
        };

        const okListener = (e) => listener(e, true);
        const cancelListener = (e) => listener(e, false);

        const cleanup = () => {
            confirmOkBtn.removeEventListener("click", okListener);
            confirmOkBtn.removeEventListener("keydown", okListener);
            confirmCancelBtn.removeEventListener("click", cancelListener);
            confirmCancelBtn.removeEventListener("keydown", cancelListener);
        };

        confirmOkBtn.addEventListener("click", okListener);
        handleEnterKey(confirmOkBtn, okListener);
        confirmCancelBtn.addEventListener("click", cancelListener);
        handleEnterKey(confirmCancelBtn, cancelListener);
    });
}


// ===================================
// FUNCIONALIDAD DE ACCESIBILIDAD (FLOTANTE/ARRASTRABLE - Copiado)
// ===================================

/**
 * Función para alternar el menú flotante de accesibilidad
 */
function toggleAccessibilityMenu() {
    const isOpen = accessibilityMenu?.classList.toggle("open");
    if (accessibilityMenu) {
        accessibilityMenu.toggleAttribute('hidden', !isOpen);
        floatingAccessibilityBtn.setAttribute('aria-expanded', isOpen);
    }
}

/**
 * Cierra el menú de accesibilidad si está abierto al hacer scroll.
 */
function closeAccessibilityMenuOnScroll() {
    if (accessibilityMenu && accessibilityMenu.classList.contains("open")) {
        isMenuClosingByScroll = true;
        toggleAccessibilityMenu(); 
        
        setTimeout(() => {
            isMenuClosingByScroll = false;
        }, 50);
    }
}

function toggleContrast() {
    const isHighContrast = body?.classList.toggle("high-contrast");
    toggleContrastBtn.setAttribute('aria-label', isHighContrast ? "Alto Contraste: ACTIVADO" : "Alto Contraste: DESACTIVADO");
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

// ===================================
// FUNCIONALIDAD DRAGGABLE PARA EL CONTENEDOR DE ACCESIBILIDAD (Copiado)
// ===================================

function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false; 
    let clickStartX, clickStartY; 
    const dragHandle = floatingAccessibilityBtn; 
    const DRAG_THRESHOLD = 5;

    if (dragHandle) {
        dragHandle.addEventListener('mousedown', dragMouseDown);
        dragHandle.addEventListener('touchstart', dragMouseDown, { passive: false });
    }

    function dragMouseDown(e) {
        // No permitir arrastre si el menú está abierto para que los botones sean accesibles
        if (e.target !== dragHandle || accessibilityMenu.classList.contains('open')) return;
        
        e = e || window.event;
        
        if (e.type === 'mousedown') {
            e.preventDefault();
        }

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        pos3 = clickStartX = clientX;
        pos4 = clickStartY = clientY;
        isDragging = false; 

        if (isMobile()) {
            body.style.overflow = 'hidden';
        }

        document.addEventListener('mouseup', closeDragElement);
        document.addEventListener('mousemove', elementDrag);
        document.addEventListener('touchend', closeDragElement, { passive: false });
        document.addEventListener('touchmove', elementDrag, { passive: false });
    }

    function elementDrag(e) {
        e = e || window.event;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        if (!isDragging) {
            const deltaX = Math.abs(clientX - clickStartX);
            const deltaY = Math.abs(clientY - clickStartY);

            if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
                isDragging = true;
                elmnt.classList.add('is-moving'); 
            } else {
                return;
            }
        } 
        
        e.preventDefault();
        pos1 = pos3 - clientX;
        pos2 = pos4 - clientY;
        pos3 = clientX;
        pos4 = clientY;
        let newTop = elmnt.offsetTop - pos2;
        let newLeft = elmnt.offsetLeft - pos1;

        // Limitar movimiento dentro de los límites de la ventana
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - elmnt.offsetHeight));
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - elmnt.offsetWidth));

        elmnt.style.top = newTop + "px";
        elmnt.style.left = newLeft + "px";
        elmnt.style.right = "unset";
        
        // Determinar alineación para el menú desplegable
        const screenCenter = window.innerWidth / 2;
        if (newLeft < screenCenter) {
            elmnt.classList.add('align-left');
        } else {
            elmnt.classList.remove('align-left');
        }
    }

    function closeDragElement() {
        document.removeEventListener('mouseup', closeDragElement);
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('touchend', closeDragElement, { passive: false });
        document.removeEventListener('touchmove', elementDrag, { passive: false });
        
        if (isMobile()) {
            body.style.overflow = '';
        }

        if (isDragging) {
            setTimeout(() => {
                elmnt.classList.remove('is-moving');
                isDragging = false;
            }, 50);
        } else {
            isDragging = false;
            elmnt.classList.remove('is-moving');
        }
    }
}

// Inicialización de Accesibilidad y Draggable
if (accessibilityContainer) {
    // FUNCIÓN DE POSICIONAMIENTO INICIAL (Posiciona Arriba-Derecha)
    function setInitialPosition() {
        const offset = 20;
        
        // Temporalmente mostramos para calcular dimensiones, luego restauramos
        const originalDisplay = accessibilityContainer.style.display;
        accessibilityContainer.style.display = 'block'; 
        
        const elWidth = accessibilityContainer.offsetWidth;
        
        accessibilityContainer.style.top = (navbar ? navbar.offsetHeight + offset : offset) + 'px';
        accessibilityContainer.style.left = (window.innerWidth - elWidth - offset) + 'px';
        
        accessibilityContainer.style.display = originalDisplay; 
        
        accessibilityContainer.style.right = 'unset';
    }
    
    setInitialPosition();
    dragElement(accessibilityContainer);
    window.addEventListener('resize', setInitialPosition);
}


// Event Listener de Accesibilidad (Asegura la apertura al hacer click/tap estacionario)
if (floatingAccessibilityBtn) {
    floatingAccessibilityBtn.addEventListener("click", (e) => {
        // Abrir el menú SOLAMENTE si el botón NO se movió (no tiene 'is-moving')
        if (!accessibilityContainer.classList.contains('is-moving')) {
            toggleAccessibilityMenu();
        } else {
            // Si tiene la clase 'is-moving', bloqueamos el click.
            e.stopPropagation(); 
            e.preventDefault();
        }
    });
    handleEnterKey(floatingAccessibilityBtn, toggleAccessibilityMenu); 
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
if (resetTextBtn) { 
    resetTextBtn.addEventListener("click", () => changeFontSize('reset'));
}


// ===================================
// FUNCIONALIDAD DE NAVBAR (MÓVIL Y CERRAR SESIÓN - Copiado)
// ===================================

/**
 * Alterna la visibilidad del menú en vista móvil.
 */
function toggleMobileMenu() {
    const isOpen = navMenu?.classList.toggle("open");
    if (menuToggleBtn) {
        menuToggleBtn.setAttribute('aria-expanded', isOpen);
    }
    body.style.overflowY = isOpen ? 'hidden' : 'auto';
}

/**
 * Encuentra el enlace activo y actualiza el texto de la vista actual en móvil.
 */
function updateCurrentPageMobile() {
    if (currentPageMobileSpan) {
        const activeLink = document.querySelector(".menu a.active");
        if (activeLink) {
            let pageName = activeLink.textContent.replace('🛒', '').trim();
            currentPageMobileSpan.textContent = pageName;
        } else {
            // Valor de respaldo (debería ser 'Admin')
            currentPageMobileSpan.textContent = document.title.split('-')[0].trim() || 'GanderSync';
        }
    }
}

/**
 * Maneja la acción de cerrar sesión.
 */
async function handleLogout(e) {
    e.preventDefault();
    const result = await showConfirm("¿Estás seguro de que deseas cerrar tu sesión?");
    if (result) {
        console.log("Sesión cerrada (Simulación)");
        // Lógica real de redirección o API de cierre de sesión
        window.location.href = "/login";
    }
}

// Event Listeners del Navbar
if (menuToggleBtn) {
    menuToggleBtn.addEventListener("click", toggleMobileMenu);
}

if (logoutLinks.length > 0) {
    logoutLinks.forEach(link => {
        link.addEventListener("click", handleLogout);
        handleEnterKey(link, handleLogout);
    });
}

// Cierra el menú móvil si se hace clic en un enlace
if (navMenu) {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                if (navMenu.classList.contains('open')) {
                    toggleMobileMenu();
                }
            }
        });
    });
}


// ===================================
// LÓGICA ESPECÍFICA DE ADMINISTRACIÓN (MODIFICADA)
// ===================================

/**
 * Maneja el clic en los botones del dashboard de administrador.
 * Redirige al administrador a las interfaces de gestión principales.
 */
function handleAdminAction(e) {
    const button = e.target.closest('button');
    const card = e.target.closest('.card');
    if (!button || !card) return;

    const cardId = card.id;
    let url = '';

    switch (cardId) {
        case 'productos':
            // Redirige a la interfaz principal de Productos.
            url = '/productos'; 
            break;
        case 'ofertas':
            // Redirige a la interfaz principal de Ofertas (donde el JS de Ofertas activa los botones para Admin).
            url = '/ofertas'; 
            break;
        case 'reportes':
            // Redirige a la interfaz de Reportes (asumiendo esta ruta).
            url = '/reportes';
            break;
        default:
            // Si hay un ID de tarjeta no mapeado.
            showAlert(`Acción no definida para el panel: ${cardId}`);
            return;
    }

    // Ejecuta la redirección
    console.log(`Redirigiendo a: ${url}`);
    window.location.href = url;
}

// Asignar listeners a las tarjetas y botones del dashboard
const adminCards = document.querySelectorAll('.admin-dashboard .card');
adminCards.forEach(card => {
    // Si solo el botón es clickable
    const button = card.querySelector('button');
    if (button) {
        button.addEventListener('click', handleAdminAction);
        handleEnterKey(button, handleAdminAction);
    }
});


// ===================================
// ANIMACIÓN DE NAVBAR Y FOOTER (Copiado)
// ===================================
const scrollThreshold = 80;
window.addEventListener("scroll", () => {
    
    closeAccessibilityMenuOnScroll(); 

    // Bloqueamos la animación de barra/pie si algún modal está abierto.
    if (
        (alertModal && !alertModal.classList.contains("hidden")) ||
        (confirmModal && !confirmModal.classList.contains("hidden"))
    ) {
        return;
    }
    

    const actualScroll = window.scrollY || document.documentElement.scrollTop;
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;


    // --- NAVBAR (Ocultar al bajar, mostrar al subir) ---
    if (actualScroll > ultimoScroll && actualScroll > scrollThreshold) {
        navbar?.classList.add('oculta');
        navbar?.classList.remove('transparente');
    } else if (actualScroll < ultimoScroll) {
        navbar?.classList.remove('oculta');
        // Solo añadimos la transparencia temporalmente al subir
        if (actualScroll > 0) {
            navbar?.classList.add('transparente');
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            navbar?.classList.remove('transparente');
        }, 300);
    }
    
    if (actualScroll <= 0) {
        navbar?.classList.remove("oculta");
        navbar?.classList.remove("transparente");
    }

    // --- FOOTER (Aparecer al final) ---
    const footerThreshold = 100;
    if (actualScroll >= scrollMax - footerThreshold) {
        footer?.classList.add("visible");
    } else {
        footer?.classList.remove("visible");
    }

    ultimoScroll = Math.max(actualScroll, 0);
}, { passive: true });

// Control de cierre de accesibilidad/navbar al hacer click fuera
window.addEventListener("click", function (e) {
    // Si el menú se está cerrando por el scroll, evitamos interferencia.
    if (isMenuClosingByScroll) {
        return;
    }
    
    // Cerrar menú de Accesibilidad (Flotante)
    if (accessibilityMenu && accessibilityMenu.classList.contains('open')) {
        // Si el click no fue dentro del contenedor de accesibilidad completo, lo cerramos.
        if (!e.target.closest('.accessibility-container')) {
            toggleAccessibilityMenu(); 
        }
    }

    // Cerrar menú móvil al hacer clic fuera
    if (navMenu && navMenu.classList.contains('open') && window.innerWidth <= 768) {
        // NO cerrar si el click fue dentro de la barra de navegación o el contenedor de accesibilidad.
        if (!e.target.closest('.barra-navegacion') && !e.target.closest('.accessibility-container')) {
             toggleMobileMenu();
        }
    }
});

// ===================================
// INICIALIZACIÓN
// ===================================
window.addEventListener("load", () => {
    document.body.classList.add("loaded");
    document.documentElement.style.setProperty('--font-scale', '1.0'); 
    updateCurrentPageMobile(); 
});
window.addEventListener('resize', updateCurrentPageMobile);