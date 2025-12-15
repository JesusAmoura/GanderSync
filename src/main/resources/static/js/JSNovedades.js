// JSNovedades.js - Script Completo para Calendario de Novedades
// Gestiona FullCalendar, Firebase Realtime Database, Accesibilidad Flotante y Navbar.

// ===================================
// VARIABLES GLOBALES DEL DOM
// ===================================

const body = document.getElementById("body") || document.body; // Asegurar body
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

// Elementos de Accesibilidad (Ajustado a Contenedor Flotante/Arrastrable)
const floatingAccessibilityBtn = document.getElementById("floatingAccessibilityBtn");
const accessibilityContainer = document.querySelector(".accessibility-container"); // Contenedor arrastrable
const accessibilityMenu = document.getElementById("accessibility-menu"); // Menú/Caja de controles
const toggleContrastBtn = document.getElementById("toggleContrastBtn");
const increaseTextBtn = document.getElementById("increaseTextBtn");
const decreaseTextBtn = document.getElementById("decreaseTextBtn");
const resetTextBtn = document.getElementById("resetTextBtn"); 

// Elementos del Navbar
const menuToggleBtn = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".menu"); // <nav class="menu">
const logoutLinks = document.querySelectorAll(".logout-btn, .logout-btn-mobile"); 
const currentPageMobileSpan = document.getElementById("current-page-mobile");
const navLinks = document.querySelectorAll(".menu a");


// Constantes de Accesibilidad
const FONT_SCALE_STEP = 0.1;
const FONT_SCALE_MAX = 1.5;
const FONT_SCALE_MIN = 0.8;

let ultimoScroll = 0;
let scrollTimeout;
let isMenuClosingByScroll = false; 
let selectedEvent = null; // Almacena el objeto FullCalendar Event para edición/eliminación

// Función de utilidad para detectar móvil
const isMobile = () => window.innerWidth <= 768;


// ===================================
// FUNCIONES DE UTILIDAD Y MODALES
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
// FUNCIONALIDAD DE ACCESIBILIDAD (FLOTANTE/ARRASTRABLE)
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
// FUNCIONALIDAD DRAGGABLE PARA EL CONTENEDOR DE ACCESIBILIDAD (Lógica Click vs. Drag)
// ===================================

function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false; 
    let clickStartX, clickStartY; 
    const dragHandle = floatingAccessibilityBtn; 
    const DRAG_THRESHOLD = 5; // Mínimo movimiento en píxeles para ser considerado arrastre

    if (dragHandle) {
        // Usamos addEventListener para mejor control y no sobreescribir otros eventos
        dragHandle.addEventListener('mousedown', dragMouseDown);
        dragHandle.addEventListener('touchstart', dragMouseDown, { passive: false }); 
    }

    function dragMouseDown(e) {
        if (e.target !== dragHandle || accessibilityMenu.classList.contains('open')) return;

        e = e || window.event;
        
        // No prevenir por defecto el evento inicial, excepto para la selección de texto en desktop
        if (e.type === 'mousedown') {
            e.preventDefault(); 
        }

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        pos3 = clickStartX = clientX;
        pos4 = clickStartY = clientY;
        isDragging = false; 

        // CLAVE: Si es móvil, bloqueamos el scroll del body al iniciar el potencial arrastre.
        if (isMobile()) {
            body.style.overflow = 'hidden';
        }

        // Añadir Listeners globales para el movimiento
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
                // Se detectó arrastre: Cambiar a modo DRAG
                isDragging = true;
                elmnt.classList.add('is-moving'); 
            } else {
                return; // No es un arrastre aún
            }
        } 
        
        // CLAVE: Solo prevenimos el comportamiento por defecto (scroll/toque) si ya estamos arrastrando.
        // Esto evita que el scroll de la página se active en móvil.
        e.preventDefault(); 
        
        // Ejecutar el movimiento
        pos1 = pos3 - clientX;
        pos2 = pos4 - clientY;
        pos3 = clientX;
        pos4 = clientY;

        let newTop = elmnt.offsetTop - pos2;
        let newLeft = elmnt.offsetLeft - pos1;

        // Limitar movimiento dentro de la ventana
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - elmnt.offsetHeight));
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - elmnt.offsetWidth));

        elmnt.style.top = newTop + "px";
        elmnt.style.left = newLeft + "px";
        elmnt.style.right = "unset"; 
        
        // Ajuste de alineación visual
        const screenCenter = window.innerWidth / 2;
        if (newLeft < screenCenter) {
            elmnt.classList.add('align-left');
        } else {
            elmnt.classList.remove('align-left');
        }
    }

    function closeDragElement() {
        // Limpiar Listeners
        document.removeEventListener('mouseup', closeDragElement);
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('touchend', closeDragElement, { passive: false });
        document.removeEventListener('touchmove', elementDrag, { passive: false });
        
        // CLAVE: Restaurar el scroll del body si se había bloqueado en móvil
        if (isMobile()) {
            body.style.overflow = '';
        }

        // Si hubo arrastre, establecemos la bandera para evitar el click accidental.
        if (isDragging) {
            setTimeout(() => {
                elmnt.classList.remove('is-moving');
                isDragging = false;
            }, 50); // Pequeño delay para que el listener de 'click' lo detecte y se detenga
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
// FUNCIONALIDAD DE NAVBAR (MÓVIL Y CERRAR SESIÓN)
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
// LÓGICA DE FIREBASE Y VALIDACIÓN
// ===================================

// Asegurarse de que eventsRef esté definido en el ámbito global (viene del HTML)
if (typeof eventsRef === 'undefined') {
    console.error("Error: eventsRef (Firebase) no está definido. Revisa la inicialización en el HTML.");
}

/**
 * Valida si una fecha excede los 10 años a partir de la fecha actual.
 * @param {string} dateStr - Fecha en formato 'YYYY-MM-DD'.
 * @returns {boolean} - true si la fecha es válida, false si excede el límite.
 */
function validateDateRange(dateStr) {
    const inputDate = new Date(dateStr);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 10);
    
    return inputDate <= maxDate;
}

/**
 * Guarda un nuevo evento en Firebase.
 * @param {object} eventData - Datos del evento (title, start, end).
 * @returns {string | null} - El ID del nuevo evento o null si falla.
 */
function saveEventToFirebase(eventData) {
    if (typeof eventsRef === 'undefined') return null;
    const newEventRef = eventsRef.push();
    newEventRef.set(eventData)
        .catch(error => console.error("Error al guardar en Firebase:", error));
    return newEventRef.key;
}

/**
 * Actualiza un evento existente en Firebase.
 * @param {string} eventId - El ID del evento a actualizar.
 * @param {object} eventData - Los datos a actualizar.
 */
function updateEventInFirebase(eventId, eventData) {
    if (typeof eventsRef === 'undefined') return;
    eventsRef.child(eventId).update(eventData)
        .catch(error => console.error("Error al actualizar en Firebase:", error));
}

/**
 * Elimina un evento de Firebase.
 * @param {string} eventId - El ID del evento a eliminar.
 */
function deleteEventFromFirebase(eventId) {
    if (typeof eventsRef === 'undefined') return;
    eventsRef.child(eventId).remove()
        .catch(error => console.error("Error al eliminar en Firebase:", error));
}

/**
 * Carga eventos desde Firebase y configura la sincronización en tiempo real.
 */
function setupFirebaseSynchronization(calendar) {
    if (typeof eventsRef === 'undefined') return;

    eventsRef.on('value', (snapshot) => {
        calendar.removeAllEvents(); 
        const firebaseEvents = [];
        snapshot.forEach((childSnapshot) => {
            const eventData = childSnapshot.val();
            const eventId = childSnapshot.key;
            
            firebaseEvents.push({
                id: eventId,
                title: eventData.title,
                start: eventData.start,
                end: eventData.end || null,
                allDay: true
            });
        });

        calendar.addEventSource(firebaseEvents);

    }, (error) => {
        console.error("Error al sincronizar eventos de Firebase:", error);
        showAlert("⚠️ Error de conexión en tiempo real con la base de datos.");
    });
}


// ===================================
// LÓGICA DE FULLCALENDAR
// ===================================

document.addEventListener("DOMContentLoaded", function () {
    const calendarEl = document.getElementById("calendar");
    const modal = document.getElementById("eventModal");
    const closeBtn = document.querySelector(".modal .close");
    const editForm = document.getElementById("editForm");
    const deleteBtn = document.getElementById("deleteBtn");
    const addForm = document.getElementById("eventForm");

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        locale: "es", 
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        },
        buttonText: { 
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            list: 'Lista'
        },
        selectable: true,
        editable: true,
        events: [], 
        
        eventClick(info) {
            selectedEvent = info.event;
            abrirModal(info.event);
        },
        
        eventDrop: function(info) {
            const { event } = info;
            const eventData = {
                title: event.title,
                start: event.startStr,
                end: event.endStr || null
            };
            updateEventInFirebase(event.id, eventData);
            showAlert("✅ Evento movido y actualizado.");
        },
        eventResize: function(info) {
            const { event } = info;
            const eventData = {
                title: event.title,
                start: event.startStr,
                end: event.endStr || null
            };
            updateEventInFirebase(event.id, eventData);
            showAlert("✅ Rango de evento actualizado.");
        },
        datesSet: function() {
        }
    });

    calendar.render();
    
    setupFirebaseSynchronization(calendar);
    
    function abrirModal(evento) {
        modal.style.display = "flex";
        modal.classList.remove("hidden");
        modal.removeAttribute("hidden"); // Asegurar accesibilidad
        document.getElementById("editTitle").value = evento.title;
        document.getElementById("editStart").value = evento.startStr.split("T")[0];
        
        const endValue = evento.end ? evento.endStr.split("T")[0] : "";
        document.getElementById("editEnd").value = endValue;
        
        document.getElementById("editTitle").focus(); 
    }

    const closeModal = () => {
        modal.style.display = "none";
        modal.classList.add("hidden");
        modal.setAttribute("hidden", "true");
        selectedEvent = null; 
    };

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
        handleEnterKey(closeBtn, closeModal);
    }

    window.onclick = function (e) {
        if (e.target === modal) {
            closeModal();
        }
    };

    // FORMULARIO PARA AGREGAR EVENTOS
    addForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const title = document.getElementById("title").value.trim();
        const start = document.getElementById("start").value;
        const end = document.getElementById("end").value;
        
        if (!title || !start) {
            await showAlert("❌ Debes ingresar un título y una fecha de inicio.");
            return;
        }
        
        if (!validateDateRange(start)) {
            await showAlert("🛑 La fecha de inicio no puede ser mayor a 10 años en el futuro.");
            return;
        }

        const newEventData = {
            title: title,
            start: start,
            end: end || null,
        };
        
        saveEventToFirebase(newEventData);

        addForm.reset();
        await showAlert("✅ Evento agregado y guardado.");
    });

    handleEnterKey(document.getElementById('title'), () => document.getElementById('start').focus());
    handleEnterKey(document.getElementById('start'), () => document.getElementById('end').focus());
    handleEnterKey(document.getElementById('end'), () => addForm.querySelector('button[type="submit"]').click());


    // GUARDAR CAMBIOS EN EVENTO (EDITAR)
    editForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        
        if (!selectedEvent) {
             await showAlert("❌ Error al editar: Evento no seleccionado.");
             return;
        }
        
        const newTitle = document.getElementById("editTitle").value.trim();
        const newStart = document.getElementById("editStart").value;
        const newEnd = document.getElementById("editEnd").value;
        
        if (!newTitle || !newStart) {
            await showAlert("❌ El título y la fecha de inicio no pueden estar vacíos.");
            return;
        }

        if (!validateDateRange(newStart)) {
            await showAlert("🛑 La fecha de inicio no puede ser mayor a 10 años en el futuro.");
            return;
        }

        const updatedEventData = {
            title: newTitle,
            start: newStart,
            end: newEnd || null
        };
        
        selectedEvent.setProp("title", newTitle);
        selectedEvent.setStart(newStart);
        selectedEvent.setEnd(newEnd || null); 

        updateEventInFirebase(selectedEvent.id, updatedEventData);

        await showAlert("✅ Evento actualizado y guardado.");
        closeModal();
    });

    handleEnterKey(document.getElementById('editTitle'), () => document.getElementById('editStart').focus());
    handleEnterKey(document.getElementById('editStart'), () => document.getElementById('editEnd').focus());
    handleEnterKey(document.getElementById('editEnd'), () => editForm.querySelector('button.guardar').click());


    // ELIMINAR EVENTO 
    deleteBtn.addEventListener("click", async function () {
        if (!selectedEvent || !selectedEvent.id) {
             await showAlert("❌ Error al eliminar: No se encontró el evento o su ID.");
             return;
        } 
        
        const confirmed = await showConfirm("¿Estás seguro de que deseas eliminar este evento?");

        if (confirmed) {
            const eventIdToDelete = selectedEvent.id;
            
            deleteEventFromFirebase(eventIdToDelete);
            
            selectedEvent.remove(); 
            
            await showAlert("🗑️ Evento eliminado y borrado.");
        }
        
        closeModal();
    });
    
});


// ===================================
// ANIMACIÓN DE NAVBAR Y FOOTER
// ===================================
const scrollThreshold = 80;

window.addEventListener("scroll", () => {
    
    closeAccessibilityMenuOnScroll(); 

    if (navMenu && navMenu.classList.contains("open") && window.innerWidth <= 768) {
        // No cerramos el menú móvil aquí con toggleMobileMenu si está en scroll.
        // Lo dejamos para el listener global de click/touch o el listener de resize.
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
    updateCurrentPageMobile(); 
});

window.addEventListener('resize', updateCurrentPageMobile);