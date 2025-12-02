const body = document.getElementById("body");
const navbar = document.querySelector(".barra-navegacion");
const footer = document.querySelector(".footer");

// Elementos de Modales de Alerta/Confirmación
const alertModal = document.getElementById("alertModal");
const alertMessage = document.getElementById("alertMessage");
const alertCloseBtn = document.getElementById("alertCloseBtn");
const confirmModal = document.getElementById("confirmModal");
const confirmMessage = document.getElementById("confirmMessage");
// CORRECCIÓN: Había un error de asignación doble en confirmCancelBtn
const confirmOkBtn = document.getElementById("confirmOkBtn");
const confirmCancelBtn = document.getElementById("confirmCancelBtn"); 

// Elementos de Accesibilidad 
const floatingAccessibilityBtn = document.getElementById("floatingAccessibilityBtn");
const accessibilityContainer = document.querySelector(".accessibility-container"); // Contenedor arrastrable
const accessibilityMenu = document.getElementById("accessibility-menu"); 
const toggleContrastBtn = document.getElementById("toggleContrastBtn");
const increaseTextBtn = document.getElementById("increaseTextBtn");
const decreaseTextBtn = document.getElementById("decreaseTextBtn");
const resetTextBtn = document.getElementById("resetTextBtn"); 

// Constantes de Accesibilidad
const FONT_SCALE_STEP = 0.1;
const FONT_SCALE_MAX = 1.5;
const FONT_SCALE_MIN = 0.8;

let ultimoScroll = 0;
let scrollTimeout;
let isMenuClosingByScroll = false; // Flag para evitar que el click listener interfiera

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
 * Nueva función CLAVE: Cierra el menú de accesibilidad si está abierto.
 */
function closeAccessibilityMenuOnScroll() {
    if (accessibilityMenu && accessibilityMenu.classList.contains("open")) {
        // Marcamos la bandera para evitar que el click listener (window.click) interfiera.
        isMenuClosingByScroll = true; 
        toggleAccessibilityMenu(); 
        
        // Retrasamos la desactivación de la bandera un momento.
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

// Event Listeners de Accesibilidad
if (floatingAccessibilityBtn) {
    floatingAccessibilityBtn.addEventListener("click", (e) => {
        // Solo abre/cierra si NO se está moviendo (click instantáneo)
        if (!e.target.closest('.is-moving')) {
            toggleAccessibilityMenu();
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
// FUNCIONALIDAD DRAGGABLE PARA EL CONTENEDOR DE ACCESIBILIDAD
// ===================================
// ... (Toda la lógica de dragElement y dragMouseDown/elementDrag/closeDragElement se mantiene igual) ...

function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    let clickStartX, clickStartY; 
    const dragHandle = floatingAccessibilityBtn; 
    const DRAG_THRESHOLD = 5; 

    if (dragHandle) {
        dragHandle.onmousedown = dragMouseDown;
        dragHandle.ontouchstart = dragMouseDown; 
    }

    function dragMouseDown(e) {
        if (e.target !== dragHandle) return;

        e = e || window.event;
        e.preventDefault(); 

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        pos3 = clickStartX = clientX;
        pos4 = clickStartY = clientY;
        isDragging = false; 

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        document.ontouchend = closeDragElement;
        document.ontouchmove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        if (!isDragging) {
            const deltaX = Math.abs(clientX - clickStartX);
            const deltaY = Math.abs(clientY - clickStartY);

            if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
                isDragging = true;
                elmnt.classList.add('dragging'); 
                elmnt.classList.add('is-moving'); 
            } else {
                return;
            }
        }

        pos1 = pos3 - clientX;
        pos2 = pos4 - clientY;
        pos3 = clientX;
        pos4 = clientY;

        let newTop = elmnt.offsetTop - pos2;
        let newLeft = elmnt.offsetLeft - pos1;

        // Limitar movimiento
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - elmnt.offsetHeight));
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - elmnt.offsetWidth));

        elmnt.style.top = newTop + "px";
        elmnt.style.left = newLeft + "px";
        elmnt.style.right = "unset"; 
        
        // LÓGICA DE AJUSTE DE ALINEACIÓN
        const screenCenter = window.innerWidth / 2;
        if (newLeft < screenCenter) {
            elmnt.classList.add('align-left');
        } else {
            elmnt.classList.remove('align-left');
        }
    }

    function closeDragElement(e) {
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchmove = null;

        if (isDragging) {
            elmnt.classList.remove('dragging');
            
            setTimeout(() => {
                elmnt.classList.remove('is-moving');
            }, 10); 
            
            isDragging = false; 
        }
    }
}

// Aplicar la función de arrastre al contenedor de accesibilidad
if (accessibilityContainer) {
    accessibilityContainer.style.right = 'unset';
    accessibilityContainer.style.left = (window.innerWidth - accessibilityContainer.offsetWidth - 20) + 'px';
    dragElement(accessibilityContainer);
}

// ===================================
// ANIMACIÓN DE NAVBAR Y FOOTER
// ===================================
const scrollThreshold = 80;

window.addEventListener("scroll", () => {
    
    // **NUEVA LÓGICA:** Cierra inmediatamente el menú de accesibilidad si está abierto.
    closeAccessibilityMenuOnScroll(); 
    
    // Si algún modal de ALERTA/CONFIRMACIÓN está abierto, bloqueamos la animación de barra/pie.
    if (
      (alertModal && !alertModal.classList.contains("hidden")) ||
      (confirmModal && !confirmModal.classList.contains("hidden"))
    )
        return;
    
    // NOTA: Eliminamos la condición (accessibilityMenu && accessibilityMenu.classList.contains("open"))
    // del return, ya que lo estamos cerrando justo arriba.

    const actualScroll = window.scrollY || document.documentElement.scrollTop;
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;


    // --- NAVBAR (Ocultar al bajar, mostrar al subir) ---
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
        navbar?.classList.remove("oculta");
        navbar?.classList.remove("transparente");
    }

    // --- FOOTER (Aparecer al final, desaparecer al subir) ---
    const footerThreshold = 100; 

    if (actualScroll >= scrollMax - footerThreshold) {
        footer?.classList.add("visible");
    } else {
        footer?.classList.remove("visible");
    }

    ultimoScroll = Math.max(actualScroll, 0);
}, { passive: true });

// Control de cierre de accesibilidad al hacer click fuera
window.addEventListener("click", function (e) {
    // Si el menú se está cerrando por el scroll, evitamos que el click listener
    // lo intente cerrar de nuevo e interfiera con el scroll.
    if (isMenuClosingByScroll) {
        return;
    }
    
    if (accessibilityMenu && accessibilityMenu.classList.contains('open')) {
        if (!e.target.closest('.accessibility-container') && e.target !== floatingAccessibilityBtn) {
            toggleAccessibilityMenu(); 
        }
    }
});

// ===================================
// INICIALIZACIÓN
// ===================================
window.addEventListener("load", () => {
    document.body.classList.add("loaded");
    document.documentElement.style.setProperty('--font-scale', '1.0'); 
});