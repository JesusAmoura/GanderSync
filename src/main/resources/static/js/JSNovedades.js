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
            alertCloseBtn.focus(); 

            const closeListener = (e) => {
                if (e.type === 'click' || (e.type === 'keydown' && e.key === 'Enter')) {
                    e.preventDefault();
                    alertModal.classList.add("hidden");
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
        confirmOkBtn.focus();

        const listener = (e, value) => {
            if (e.type === 'click' || (e.type === 'keydown' && e.key === 'Enter')) {
                e.preventDefault();
                confirmModal.classList.add("hidden");
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
    accessibilitySidebar?.classList.toggle("open");
    floatingAccessibilityBtn.setAttribute('aria-expanded', accessibilitySidebar?.classList.contains('open'));
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


// ===================================
// LÓGICA DE FULLCALENDAR
// ===================================

document.addEventListener("DOMContentLoaded", function () {
    const calendarEl = document.getElementById("calendar");
    let selectedEvent = null;

    const modal = document.getElementById("eventModal");
    const closeBtn = document.querySelector(".modal .close");
    const editForm = document.getElementById("editForm");
    const deleteBtn = document.getElementById("deleteBtn");
    const addForm = document.getElementById("eventForm");

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        locale: "es", // Asegura que el calendario esté en español
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        },
        buttonText: { // Traducción de los botones de vista
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            list: 'Lista'
        },
        selectable: true,
        editable: true,
        events: [
            { id: '1', title: "Lanzamiento nueva versión", start: "2025-08-25" },
            { id: '2', title: "Mantenimiento del sistema", start: "2025-08-28", end: "2025-08-29" },
            { id: '3', title: "Reunión de equipo", start: "2025-08-30T10:00:00" },
        ],
        dateClick(info) {
            document.getElementById("start").value = info.dateStr.split("T")[0];
            document.getElementById("title").focus();
        },
        eventClick(info) {
            // Se asigna el evento seleccionado para su edición/eliminación
            selectedEvent = info.event;
            abrirModal(info.event);
        },
    });

    calendar.render();

    // Abrir Modal de Edición
    function abrirModal(evento) {
        modal.style.display = "flex";
        modal.classList.remove("hidden");
        document.getElementById("editTitle").value = evento.title;
        document.getElementById("editStart").value = evento.startStr.split("T")[0];
        // Si el evento no tiene fecha de fin, se deja vacío.
        document.getElementById("editEnd").value = evento.end ? evento.endStr.split("T")[0] : "";
        document.getElementById("editTitle").focus(); 
    }

    // Cerrar Modal
    const closeModal = () => {
        modal.style.display = "none";
        modal.classList.add("hidden");
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

    // =====================
    // FORMULARIO PARA AGREGAR EVENTOS
    // =====================
    addForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const title = document.getElementById("title").value.trim();
        const start = document.getElementById("start").value;
        const end = document.getElementById("end").value;

        if (!title || !start) {
            await showAlert("❌ Debes ingresar un título y una fecha de inicio.");
            return;
        }
        
        // Agregar el evento al calendario
        calendar.addEvent({
            title: title,
            start: start,
            end: end || null,
            // ID temporal para evitar duplicados si la lista es estática
            id: 'temp-' + Date.now() 
        });

        addForm.reset();
        await showAlert("✅ Evento agregado al calendario.");
    });

    // Implementar Enter en inputs del formulario de AGREGAR
    handleEnterKey(document.getElementById('title'), () => document.getElementById('start').focus());
    handleEnterKey(document.getElementById('start'), () => document.getElementById('end').focus());
    handleEnterKey(document.getElementById('end'), () => addForm.querySelector('button[type="submit"]').click());


    // =====================
    // GUARDAR CAMBIOS EN EVENTO (EDITAR)
    // =====================
    editForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        
        const newTitle = document.getElementById("editTitle").value.trim();
        const newStart = document.getElementById("editStart").value;
        const newEnd = document.getElementById("editEnd").value;
        
        if (selectedEvent && newTitle && newStart) {
            // Actualizar propiedades del evento seleccionado
            selectedEvent.setProp("title", newTitle);
            selectedEvent.setStart(newStart);
            selectedEvent.setEnd(newEnd || null); // Usa null si no hay fecha de fin
            await showAlert("✅ Evento actualizado.");
            closeModal();
        } else {
            await showAlert("❌ El título y la fecha de inicio no pueden estar vacíos.");
        }
    });

    // Implementar Enter en inputs del formulario de EDITAR
    handleEnterKey(document.getElementById('editTitle'), () => document.getElementById('editStart').focus());
    handleEnterKey(document.getElementById('editStart'), () => document.getElementById('editEnd').focus());
    handleEnterKey(document.getElementById('editEnd'), () => editForm.querySelector('button.guardar').click());


    // =====================
    // ELIMINAR EVENTO
    // =====================
    deleteBtn.addEventListener("click", async function () {
        if (!selectedEvent) return; 

        // 1. Mostrar confirmación asíncrona
        const confirmed = await showConfirm("¿Estás seguro de que deseas eliminar este evento?");

        if (confirmed) {
            // 2. Si se confirma, eliminar el evento
            selectedEvent.remove(); 
            // 3. Mostrar alerta de éxito
            await showAlert("🗑️ Evento eliminado.");
        }
        // 4. Cerrar el modal de edición/eliminación
        closeModal();
    });

});


// ===================================
// ANIMACIÓN DE NAVBAR Y FOOTER
// ===================================
const scrollThreshold = 80;

window.addEventListener("scroll", () => {
    const actualScroll = window.scrollY || document.documentElement.scrollTop;

    // Control de visibilidad de la barra de navegación
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

    ultimoScroll = Math.max(actualScroll, 0);

    // FOOTER visible al llegar al final
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= scrollMax - 5) {
        footer?.classList.add("visible");
    } else {
        footer?.classList.remove("visible");
    }
}, { passive: true });

// Control de cierre de accesibilidad al hacer click fuera
window.addEventListener("click", function (e) {
    if (accessibilitySidebar && accessibilitySidebar.classList.contains('open')) {
        if (!e.target.closest('.accessibility-sidebar') && e.target !== floatingAccessibilityBtn) {
            accessibilitySidebar.classList.remove('open');
            floatingAccessibilityBtn.setAttribute('aria-expanded', 'false');
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