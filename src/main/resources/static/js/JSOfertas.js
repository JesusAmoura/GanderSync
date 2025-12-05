const form = document.getElementById('uploadForm');
const grid = document.getElementById('ofertasGrid');
const body = document.getElementById("body");

const navbar = document.querySelector('.barra-navegacion');
const footer = document.querySelector('.footer');
const fileLabel = document.querySelector('.file-label');

const alertModal = document.getElementById("alertModal");
const alertMessage = document.getElementById("alertMessage");
const alertCloseBtn = document.getElementById("alertCloseBtn");

const confirmModal = document.getElementById("confirmModal");
const confirmMessage = document.getElementById("confirmMessage");
const confirmOkBtn = document.getElementById("confirmOkBtn");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");

const floatingAccessibilityBtn = document.getElementById("floatingAccessibilityBtn");
const accessibilitySidebar = document.getElementById("accessibility-sidebar");
const closeAccessibility = document.getElementById("closeAccessibility");
const toggleContrastBtn = document.getElementById("toggleContrastBtn");
const increaseTextBtn = document.getElementById("increaseTextBtn");
const decreaseTextBtn = document.getElementById("decreaseTextBtn");

const FONT_SCALE_STEP = 0.1;
const FONT_SCALE_MAX = 1.5;
const FONT_SCALE_MIN = 0.8;

let ofertas = JSON.parse(localStorage.getItem('ofertas')) || [];
let editando = null;

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
            alertCloseBtn.addEventListener("keydown", closeListener);
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
            confirmOkBtn.removeEventListener("keydown", okListener);
            confirmCancelBtn.removeEventListener("click", cancelListener);
            confirmCancelBtn.removeEventListener("keydown", cancelListener);
        };

        confirmOkBtn.addEventListener("click", okListener);
        confirmOkBtn.addEventListener("keydown", okListener);
        confirmCancelBtn.addEventListener("click", cancelListener);
        confirmCancelBtn.addEventListener("keydown", cancelListener);
    });
}

function toggleAccessibilitySidebar() {
    accessibilitySidebar?.classList.toggle("open");
}

function toggleContrast() {
    const isHighContrast = body?.classList.toggle("high-contrast");
    toggleContrastBtn.textContent = isHighContrast ? "Alto Contraste: ON" : "Alto Contraste: OFF";
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
// LÓGICA DE OFERTAS (Corregida con Modales y Enter)
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
// ANIMACIÓN DE NAVBAR Y FOOTER
// ===================================
let ultimoScroll = 0;
let scrollTimeout;
const scrollThreshold = 80;

window.addEventListener('scroll', () => {
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
        navbar?.classList.remove('oculta');
        navbar?.classList.remove('transparente');
    }

    ultimoScroll = Math.max(actualScroll, 0);

    // FOOTER visible al llegar al final
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= scrollMax - 5) {
        footer?.classList.add('visible');
    } else {
        footer?.classList.remove('visible');
    }
}, { passive: true });

// Control de cierre de accesibilidad al hacer click fuera
window.addEventListener("click", function (e) {
    if (accessibilitySidebar && accessibilitySidebar.classList.contains('open')) {
        if (!e.target.closest('.accessibility-sidebar') && e.target !== floatingAccessibilityBtn) {
            accessibilitySidebar.classList.remove('open');
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
});

// Implementar manejo de Enter en todos los inputs del formulario
handleEnterKey(document.getElementById('nombre'), () => document.getElementById('precioOriginal').focus());
handleEnterKey(document.getElementById('precioOriginal'), () => document.getElementById('precioOferta').focus());
handleEnterKey(document.getElementById('precioOferta'), () => form.querySelector('button[type="submit"]').click());
handleEnterKey(document.querySelector('.file-label'), () => document.getElementById('archivoImagen').click());