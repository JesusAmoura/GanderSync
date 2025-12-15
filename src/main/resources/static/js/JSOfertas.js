// JSOfertas.js - Script Completo para Gestión de Ofertas
// Incluye Navbar y Accesibilidad Flotante (actualizados de JSNovedades.js).

// ===================================
// VARIABLES GLOBALES DEL DOM
// ===================================

const form = document.getElementById('uploadForm');
const grid = document.getElementById('ofertasGrid');
const body = document.getElementById("body") || document.body; // Asegurar body
const fileLabel = document.querySelector('.file-label'); // Se mantiene para el formulario de ofertas

// Elementos de Modales de Alerta/Confirmación (Se mantienen)
const alertModal = document.getElementById("alertModal");
const alertMessage = document.getElementById("alertMessage");
const alertCloseBtn = document.getElementById("alertCloseBtn");
const confirmModal = document.getElementById("confirmModal");
const confirmMessage = document.getElementById("confirmMessage");
const confirmOkBtn = document.getElementById("confirmOkBtn");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");


// --- INICIO DE CÓDIGO PEGADO DE NOVEDADES (Navbar y Accesibilidad NUEVOS) ---

// Elementos del Navbar
const navbar = document.querySelector(".barra-navegacion");
const footer = document.querySelector(".footer");
const menuToggleBtn = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".menu"); // <nav class="menu">
const logoutLinks = document.querySelectorAll(".logout-btn, .logout-btn-mobile"); 
const currentPageMobileSpan = document.getElementById("current-page-mobile");
const navLinks = document.querySelectorAll(".menu a");

// Elementos de Accesibilidad (Ajustado a Contenedor Flotante/Arrastrable)
const floatingAccessibilityBtn = document.getElementById("floatingAccessibilityBtn");
const accessibilityContainer = document.querySelector(".accessibility-container"); // Contenedor arrastrable
const accessibilityMenu = document.getElementById("accessibility-menu"); // Menú/Caja de controles
const toggleContrastBtn = document.getElementById("toggleContrastBtn");
const increaseTextBtn = document.getElementById("increaseTextBtn");
const decreaseTextBtn = document.getElementById("decreaseTextBtn");
const resetTextBtn = document.getElementById("resetTextBtn"); // Nuevo botón añadido

// Constantes de Accesibilidad
const FONT_SCALE_STEP = 0.1;
const FONT_SCALE_MAX = 1.5;
const FONT_SCALE_MIN = 0.8;

let ultimoScroll = 0;
let scrollTimeout;
let isMenuClosingByScroll = false; 

// Función de utilidad para detectar móvil
const isMobile = () => window.innerWidth <= 768;

// --- FIN DE CÓDIGO PEGADO DE NOVEDADES ---


let ofertas = JSON.parse(localStorage.getItem('ofertas')) || [];
let editando = null;

// ===================================
// FUNCIONES DE UTILIDAD Y MODALES (Corregidas y Unificadas)
// ===================================

/**
 * Maneja la pulsación de la tecla Enter para simular un clic.
 * @param {HTMLElement} element - El elemento DOM al que añadir el listener.
 * @param {Function} callback - La función a ejecutar.
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

function formatCOP(n) {
    return (n || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" });
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, (m) => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]
    ));
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * Muestra el modal de alerta y devuelve una Promesa que se resuelve al cerrarse.
 * @param {string} message - Mensaje a mostrar.
 * @returns {Promise<void>}
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
 * @param {string} message - Mensaje de confirmación.
 * @returns {Promise<boolean>} - true si confirma, false si cancela.
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
// FUNCIONALIDAD DE ACCESIBILIDAD (FLOTANTE/ARRASTRABLE - COPIADO)
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
// FUNCIONALIDAD DRAGGABLE PARA EL CONTENEDOR DE ACCESIBILIDAD (COPIADO)
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

        newTop = Math.max(0, Math.min(newTop, window.innerHeight - elmnt.offsetHeight));
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - elmnt.offsetWidth));

        elmnt.style.top = newTop + "px";
        elmnt.style.left = newLeft + "px";
        elmnt.style.right = "unset"; 
        
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

// Aplicar la función de arrastre al contenedor de accesibilidad al cargar la página
if (accessibilityContainer) {
    // FUNCIÓN DE POSICIONAMIENTO INICIAL (Posiciona Arriba-Derecha)
    function setInitialPosition() {
        const offset = 20; // Margen de 20px
        
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
        // CLAVE: Abrir el menú SOLAMENTE si el botón NO tiene la clase 'is-moving' 
        if (!accessibilityContainer.classList.contains('is-moving')) {
            toggleAccessibilityMenu();
        } else {
            // Si tiene la clase 'is-moving' (es decir, se acaba de mover), bloqueamos el click.
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
// FUNCIONALIDAD DE NAVBAR (MÓVIL Y CERRAR SESIÓN - COPIADO)
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
            // Valor de respaldo
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
// LÓGICA DE OFERTAS
// ===================================

function guardarLocal() {
    localStorage.setItem('ofertas', JSON.stringify(ofertas));
}

function renderOfertas() {
    if (!grid) return;
    grid.innerHTML = '';
    ofertas.forEach((oferta, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute("tabindex", "0"); 
        card.innerHTML = `
            <img src="${escapeHtml(oferta.imagen)}" alt="${escapeHtml(oferta.nombre)}" loading="lazy">
            <h3>${escapeHtml(oferta.nombre)}</h3>
            <p><del>${formatCOP(oferta.precioOriginal)}</del> <strong>${formatCOP(oferta.precioOferta)}</strong></p>
            <div class="acciones">
                <button class="editar" data-index="${index}" tabindex="0">✏️ Editar</button>
                <button class="eliminar" data-index="${index}" tabindex="0">🗑️ Eliminar</button>
            </div>
        `;

        const editarBtn = card.querySelector('.editar');
        const eliminarBtn = card.querySelector('.eliminar');

        editarBtn.addEventListener('click', () => editarOferta(index));
        handleEnterKey(editarBtn, () => editarOferta(index));

        eliminarBtn.addEventListener('click', () => eliminarOferta(index));
        handleEnterKey(eliminarBtn, () => eliminarOferta(index));

        grid.appendChild(card);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreInput = form.querySelector('#nombre');
    const precioOriginalInput = form.querySelector('#precioOriginal');
    const precioOfertaInput = form.querySelector('#precioOferta');
    const archivoInput = form.querySelector('#archivoImagen');
    const boton = form.querySelector('button[type="submit"]');

    const nombre = nombreInput.value.trim();
    const precioOriginal = parseInt(precioOriginalInput.value);
    const precioOferta = parseInt(precioOfertaInput.value);
    const archivo = archivoInput.files[0];

    // Validación básica de campos
    if (!nombre || isNaN(precioOriginal) || isNaN(precioOferta) || precioOriginal <= 0 || precioOferta <= 0) {
        await showAlert("❌ Por favor, completa todos los campos con valores válidos.");
        return;
    }

    if (precioOferta >= precioOriginal) {
        await showAlert("❌ El precio de oferta debe ser menor que el precio original.");
        return;
    }

    const resetForm = () => {
        form.reset();
        editando = null;
        boton.textContent = "Subir Producto";
        boton.classList.remove("btn-secondary"); 
        boton.classList.add("btn-primary");
        fileLabel.textContent = "Subir Imagen (solo al agregar)";
    };

    if (editando !== null) {
        const oferta = ofertas[editando];

        const actualizarCampos = async (nuevaImg = oferta.imagen) => {
            oferta.nombre = nombre;
            oferta.precioOriginal = precioOriginal;
            oferta.precioOferta = precioOferta;
            oferta.imagen = nuevaImg;
            ofertas[editando] = oferta;

            guardarLocal();
            renderOfertas();
            resetForm();
            await showAlert("✅ Oferta actualizada exitosamente.");
        };

        if (archivo) {
            try {
                const base64Img = await fileToBase64(archivo);
                await actualizarCampos(base64Img);
            } catch (error) {
                console.error("Error al leer el archivo:", error);
                await showAlert("❌ Error al leer la imagen local.");
            }
        } else {
            await actualizarCampos();
        }

        return;
    }

    // Agregar nueva oferta
    if (!archivo) {
        await showAlert("❌ Debes subir una imagen del producto.");
        return;
    }

    try {
        const base64Img = await fileToBase64(archivo);
        const nuevaOferta = {
            nombre,
            precioOriginal,
            precioOferta,
            imagen: base64Img
        };

        ofertas.push(nuevaOferta);
        guardarLocal();
        renderOfertas();
        resetForm();
        await showAlert("✅ Nueva oferta agregada exitosamente.");

    } catch (error) {
        console.error("Error al subir el archivo:", error);
        await showAlert("❌ Error al subir el archivo de imagen.");
    }
});

async function eliminarOferta(index) {
    const confirmed = await showConfirm("¿Seguro que deseas eliminar esta oferta?");
    
    if (confirmed) {
        ofertas.splice(index, 1);
        guardarLocal();
        renderOfertas();
        await showAlert("🗑️ Oferta eliminada.");
    }
}

function editarOferta(index) {
    const oferta = ofertas[index];
    
    form.querySelector('#nombre').value = oferta.nombre;
    form.querySelector('#precioOriginal').value = oferta.precioOriginal;
    form.querySelector('#precioOferta').value = oferta.precioOferta;

    editando = index;
    const boton = form.querySelector('button[type="submit"]');
    boton.textContent = "Actualizar Producto";
    boton.classList.remove("btn-primary");
    boton.classList.add("btn-secondary"); 
    fileLabel.textContent = "Cambiar Imagen (opcional)";
    
    form.querySelector('#nombre').focus();
}

// ===================================
// ANIMACIÓN DE NAVBAR Y FOOTER (COPIADO)
// ===================================
const scrollThreshold = 80;

window.addEventListener("scroll", () => {
    
    closeAccessibilityMenuOnScroll(); 

    if (navMenu && navMenu.classList.contains("open") && window.innerWidth <= 768) {
        // No cerramos el menú móvil aquí con toggleMobileMenu si está en scroll.
    }
    
    // Si algún modal de ALERTA/CONFIRMACIÓN está abierto, bloqueamos la animación de barra/pie.
    if (
        (alertModal && !alertModal.classList.contains("hidden")) ||
        (confirmModal && !confirmModal.classList.contains("hidden"))
    )
        return;
    

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
        
        // CORRECCIÓN CLAVE: Agregamos el contenedor de accesibilidad a la lista de elementos
        // que NO deben cerrar el menú móvil si se hace clic en ellos.
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
    renderOfertas();
    updateCurrentPageMobile(); 
});

window.addEventListener('resize', updateCurrentPageMobile);


// Implementar manejo de Enter en todos los inputs del formulario
handleEnterKey(document.getElementById('nombre'), () => document.getElementById('precioOriginal').focus());
handleEnterKey(document.getElementById('precioOriginal'), () => document.getElementById('precioOferta').focus());
handleEnterKey(document.getElementById('precioOferta'), () => form.querySelector('button[type="submit"]').click());
handleEnterKey(document.querySelector('.file-label'), () => document.getElementById('archivoImagen').click());