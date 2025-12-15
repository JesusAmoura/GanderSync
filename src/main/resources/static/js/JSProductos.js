// ===================================
// JSProductos.js - Script Completo para Gestión de Productos
// CÓDIGO DE NAVBAR Y ACCESIBILIDAD ACTUALIZADO (Versión Limpia)
// ===================================

// ===================================
// VARIABLES DE DATOS Y ESTADO DE LA APLICACIÓN
// ===================================
const productosRef = db.ref("productos");
let productos = [];
let carrito = [];
let scrollTimeout;
let isMenuClosingByScroll = false;

// ===================================
// VARIABLES DEL DOM (Declaradas con let para ser asignadas en initApp)
// ===================================

// General
let body;
let grid;
let searchInput;
let categoriaFiltro;
let btnVistaOriginal;
let btnVistaLista;

// Variables de NAVBAR y MENÚ MÓVIL (ACTUALIZADAS)
let menuToggleBtn;
let navMenu;
let logoutLinks;
let currentPageMobileSpan;
let navLinks;

// Navbar/Vistas de Carrito
let navbarCartBtn;
let floatingCartBtn;
let cartCountNavElem;
let cartCountFloatingElem;
let productosView;
let carritoView;
let carritoSection;
let pagoSection;
let goToPagoBtn;
let backToCartBtn;
let pagarBtn;
let totalCarritoElem;

// Sidebar de Mini-Carrito
let backToProductosBtn;
let miniCartSidebar;
let closeMiniCart;
let miniCartItems;
let miniCartTotal;
let viewCartGridBtn;

// Modales y Formularios
let modal;
let closeModal;
let modalImg;
let modalNombre;
let modalInfo;
let modalUso;
let modalPrecio;
let contactoBtn;
let abrirFormBtn;
let formModal;
let closeForm;
let productoForm;
let editIndexInput;
let formTitle;
let imagenURLInput;
let imagenArchivoInput;
let alertModal;
let alertMessage;
let alertCloseBtn;
let confirmModal;
let confirmMessage;
let confirmOkBtn;
let confirmCancelBtn;
// Elementos de la interfaz general
let navbar;
let footer;
let loadingOverlay;

// Accesibilidad (ACTUALIZADAS)
let floatingAccessibilityBtn;
let accessibilityMenu;
let accessibilityContainer;
let toggleContrastBtn;
let increaseTextBtn;
let decreaseTextBtn;
let resetTextBtn;
const FONT_SCALE_STEP = 0.1;
const FONT_SCALE_MAX = 1.5;
const FONT_SCALE_MIN = 0.8;
const DRAG_THRESHOLD = 5;

// Función de utilidad para detectar móvil
const isMobile = () => window.innerWidth <= 768;
// ===================================
// FUNCIONES DE UTILIDAD (Mantienen las funciones de modales y formato)
// ===================================

/**
 * Maneja la pulsación de la tecla Enter para elementos específicos.
 * @param {HTMLElement} element - El elemento DOM a escuchar.
 * @param {Function} callback - La función a ejecutar al presionar Enter.
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
 * Formatea un número como moneda colombiana (COP).
 * @param {number} n - El número a formatear.
 * @returns {string} - El valor formateado.
 */
function formatCOP(n) {
  return (n || 0).toLocaleString("es-CO", { style: "currency", currency: "COP" });
}

/**
 * Escapa caracteres HTML especiales en una cadena.
 * @param {string} str - La cadena a escapar.
 * @returns {string} - La cadena escapada.
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, (m) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]
  ));
}

/**
 * Convierte un objeto File a una cadena Base64.
 * @param {File} file - El archivo a convertir.
 * @returns {Promise<string>} - Una promesa que resuelve con la cadena Base64.
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

/**
 * Muestra un modal de alerta simple.
 * @param {string} message - El mensaje a mostrar.
 * @returns {Promise<void>} - Una promesa que resuelve al cerrar la alerta.
 */
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


          alertCloseBtn.removeEventListener("click", 
closeListener);
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

/**
 * Muestra un modal de confirmación (Sí/No).
 * @param {string} message - El mensaje a mostrar.
 * @returns {Promise<boolean>} - Una promesa que resuelve con true si se confirma, false si se cancela.
 */
function showConfirm(message) {
  return new Promise((resolve) => {
    if (!confirmMessage || !confirmModal || !confirmOkBtn || !confirmCancelBtn) {
      console.error("No se encontró el modal de confirmación.");
      resolve(false);
      return;
    }

    confirmMessage.innerHTML = message;
    confirmModal.classList.remove("hidden");
    confirmOkBtn.focus();

    const listener = (e, value) => {
      if (e.type === 'click' || (e.type === 'keydown' && e.key === 'Enter'))
      {

     
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

/**
 * Muestra el overlay de carga.
 */
function showLoading() {
    loadingOverlay?.classList.remove("hidden");
}

/**
 * Oculta el overlay de carga.
 */
function hideLoading() {
    loadingOverlay?.classList.add("hidden");
}

// ===================================
// FUNCIONES DE ACCESIBILIDAD (ACTUALIZADAS/REEMPLAZADAS)
// ===================================

/**
 * Alterna la visibilidad del menú de accesibilidad.
 */
function toggleAccessibilityMenu() {
    const isOpen = accessibilityMenu?.classList.toggle("open");
 if (accessibilityMenu) {
        accessibilityMenu.toggleAttribute('hidden', !isOpen);
        floatingAccessibilityBtn.setAttribute('aria-expanded', isOpen);
 }
}

/**
 * Cierra el menú de accesibilidad si se detecta scroll.
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

/**
 * Alterna el modo de alto contraste.
 */
function toggleContrast() {
    const isHighContrast = body?.classList.toggle("high-contrast");
 toggleContrastBtn.setAttribute('aria-label', isHighContrast ? "Alto Contraste: ACTIVADO" : "Alto Contraste: DESACTIVADO");
}

/**
 * Cambia el tamaño de la fuente globalmente.
 * @param {'increase' | 'decrease' | 'reset'} direction - La dirección del cambio.
 */
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

/**
 * Guarda la posición del elemento de accesibilidad en localStorage.
 * @param {HTMLElement} elmnt - El elemento a guardar.
 */
function savePosition(elmnt) {
    if (elmnt && elmnt.style.top && elmnt.style.left) {
        localStorage.setItem('accessibility-top', elmnt.style.top);
 localStorage.setItem('accessibility-left', elmnt.style.left);
    }
}

/**
 * Carga la posición guardada del elemento de accesibilidad.
 * @param {HTMLElement} elmnt - El elemento a posicionar.
 */
function loadPosition(elmnt) {
    const top = localStorage.getItem('accessibility-top');
 const left = localStorage.getItem('accessibility-left');

    if (top && left) {
        elmnt.style.top = top;
 elmnt.style.left = left;
        elmnt.style.right = "unset";

        const leftValue = parseFloat(left.replace('px', ''));
        const screenCenter = window.innerWidth / 2;
 if (leftValue < screenCenter) {
            elmnt.classList.add('align-left');
 } else {
            elmnt.classList.remove('align-left');
 }
    }
}

/**
 * Permite arrastrar un elemento DOM (el menú de accesibilidad).
 * @param {HTMLElement} elmnt - El elemento que se puede arrastrar.
 */
function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    let clickStartX, clickStartY;
    const dragHandle = floatingAccessibilityBtn;
    

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
        e = e ||
 window.event;

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

        e.preventDefault();
 pos1 = pos3 - clientX;
        pos2 = pos4 - clientY;
        pos3 = clientX;
        pos4 = clientY;
 let newTop = elmnt.offsetTop - pos2;
        let newLeft = elmnt.offsetLeft - pos1;
 // Limitar el movimiento dentro de la ventana
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
            savePosition(elmnt);
 setTimeout(() => {
                elmnt.classList.remove('is-moving');
                elmnt.classList.remove('dragging');
            }, 50);
 isDragging = false;
        } else {
             isDragging = false;
 elmnt.classList.remove('is-moving');
             elmnt.classList.remove('dragging');
        }
    }
}


// ===================================
// FUNCIONALIDAD DE NAVBAR (ACTUALIZADAS/REEMPLAZADAS)
// ===================================

/**
 * Alterna la visibilidad del menú en vista móvil.
 */
function toggleMobileMenu() {
    const isOpen = navMenu?.classList.toggle("open");
 if (menuToggleBtn) {
        menuToggleBtn.setAttribute('aria-expanded', isOpen);
    }
    body.style.overflowY = isOpen ?
 'hidden' : 'auto';
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
            currentPageMobileSpan.textContent = document.title.split('-')[0].trim() ||
 'GanderSync';
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
        window.location.href = "/login";
 }
}


// ===================================
// FUNCIONES DE VISTAS Y CARGAS (Sin cambios funcionales, mantienen la lógica de productos)
// ===================================

/**
 * Muestra la vista principal de productos y oculta el carrito.
 */
function mostrarVistaProductos() {
    productosView?.classList.remove("hidden");
    carritoView?.classList.add("hidden");
    miniCartSidebar?.classList.remove("open");
    if (floatingCartBtn) floatingCartBtn.style.display = 'flex';
 }

/**
 * Muestra la vista del carrito completo (tabla).
 */
function mostrarVistaCarrito() {
    productosView?.classList.add("hidden");
    carritoView?.classList.remove("hidden");
    pagoSection?.classList.add("hidden");
    carritoSection?.classList.remove("hidden");
    miniCartSidebar?.classList.remove("open");
 if (floatingCartBtn) floatingCartBtn.style.display = 'none';
    renderCarrito();
    renderMiniCarrito();
}

/**
 * Muestra la sección final de pago.
 */
function mostrarVistaPago() {
    carritoSection?.classList.add("hidden");
    pagoSection?.classList.remove("hidden");
    document.getElementById("billetera")?.focus();
}

/**
 * Alterna la visibilidad del sidebar del mini-carrito.
 */
function toggleMiniCartSidebar() {
    if (!carritoView?.classList.contains("hidden")) return;
    miniCartSidebar?.classList.toggle("open");
    renderMiniCarrito();
}

/**
 * Abre el sidebar del mini-carrito.
 */
function openMiniCart() {
    if (carritoView?.classList.contains("hidden")) {
        miniCartSidebar?.classList.add("open");
        renderMiniCarrito();
 }
}

/**
 * Aplica los filtros (búsqueda y categoría) y llama a renderProductos.
 */
function aplicarFiltrosYSort() {
  const terminoBusqueda = searchInput.value.toLowerCase().trim();
  const categoriaSeleccionada = categoriaFiltro.value;
  let listaFiltrada = productos.filter((producto) => {
    const pasaCategoria =
      categoriaSeleccionada === "todos" ||
      (producto.categoria && producto.categoria === categoriaSeleccionada);
    const pasaBusqueda =
      !terminoBusqueda ||
      (producto.nombre &&
        producto.nombre.toLowerCase().includes(terminoBusqueda));

    return pasaCategoria && pasaBusqueda;
  });
 renderProductos(listaFiltrada);
}

/**
 * Renderiza las opciones del dropdown de categorías (filtro y formulario).
 * @param {Array<Object>} productos - La lista completa de productos para extraer categorías.
 */
function renderCategoriasSelect(productos) {
    const categoriasSet = new Set();
 productos.forEach(p => {
        if (p.categoria) categoriasSet.add(p.categoria);
    });
 const categoriasBase = [
        "Ungüentos",
        "Antiparasitarios",
        "Cremas y Pomadas",
        "Hormonas",
        "Vitaminas",
        "Concentrados",
        "Garrapaticidas",
        "Mosquicidas"
    ];
 const todasLasCategorias = Array.from(new Set([...categoriasBase, ...Array.from(categoriasSet)])).sort();

    if (categoriaFiltro) {
        const selectedValue = categoriaFiltro.value;
 categoriaFiltro.innerHTML = '<option value="todos">Todas las categorías</option>';
        todasLasCategorias.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat;
            if (cat === selectedValue) option.selected = true;
            categoriaFiltro.appendChild(option);
        });
 }

    const formSelect = document.getElementById("categoria");
    if (formSelect) {
        const selectedValue = formSelect.value;
 formSelect.innerHTML = '';
        todasLasCategorias.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat;
            if (cat === selectedValue) option.selected = true;
            formSelect.appendChild(option);
        });
 }
}


/**
 * Renderiza la cuadrícula de productos.
 * @param {Array<Object>} lista - La lista de productos a mostrar.
 */
function renderProductos(lista) {
  if (!grid) return;
  grid.innerHTML = "";

  const arr = Array.isArray(lista) ?
    lista : [];
 arr.forEach((producto) => {
    const editDeleteButtonsHtml = `
        <button class="btn-editar" tabindex="0" aria-label="Editar ${escapeHtml(producto.nombre)}">✏️</button>
        <button class="btn-eliminar" tabindex="0" aria-label="Eliminar ${escapeHtml(producto.nombre)}">🗑️</button>
    `;


    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("tabindex", "0");
    card.innerHTML = `
      <div class="card-media">
        <img src="${escapeHtml(producto.imagen || "")}" alt="${escapeHtml(
      producto.nombre || ""
    )}" loading="lazy">
      </div>
 
      <div class="card-body">
        <h3>${escapeHtml(producto.nombre)}</h3>
        <p class="card-info">${escapeHtml(producto.info ||
      "")}</p>
        <p><strong>Uso:</strong> ${escapeHtml(producto.uso ||
      "")}</p>
        <p><strong>Precio:</strong> ${formatCOP(producto.precio || 0)}</p>
        <div class="card-actions">
          <button class="btn-agregar" tabindex="0" aria-label="Agregar ${escapeHtml(producto.nombre)} al carrito">🛒</button>
          <button class="btn-ver" tabindex="0" aria-label="Ver detalles de ${escapeHtml(producto.nombre)}">🔍</button>
  
          ${editDeleteButtonsHtml}
        </div>
      </div>
    `;
 card.addEventListener("click", (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('.card-actions')) return;
        abrirModal(producto);
    });
 card.addEventListener("keydown", (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            abrirModal(producto);
        }
    });
 card.querySelectorAll(".card-actions button").forEach((button) => {
      button.addEventListener("click", (e) => e.stopPropagation());
    });
 card.querySelector(".btn-agregar").addEventListener("click", () =>
      agregarAlCarrito(producto)
    );
 card.querySelector(".btn-ver").addEventListener("click", () =>
      abrirModal(producto)
    );
 card.querySelector(".btn-editar")?.addEventListener("click", () =>
        abrirFormEditar(producto)
    );
 card.querySelector(".btn-eliminar")?.addEventListener("click", () =>
        eliminarProducto(producto)
    );


    grid.appendChild(card);
  });
 }



/**
 * Cambia el estilo de la cuadrícula de productos.
 * @param {'lista' |
 * 'original'} tipo - El tipo de vista.
 */
function cambiarVista(tipo) {
  if (!grid) return;
  grid.classList.remove("vista-original", "vista-lista");
 const clase = tipo === "lista" ? "vista-lista" : "vista-original";
  grid.classList.add(clase);
}

/**
 * Abre el modal de detalles del producto.
 * @param {Object} producto - El objeto producto a mostrar.
 */
function abrirModal(producto) {
  modalImg.src = producto.imagen || "";
 modalNombre.textContent = producto.nombre || "";
  modalInfo.textContent = producto.info || "";
  modalUso.textContent = producto.uso || "";
  modalPrecio.textContent = formatCOP(producto.precio || 0);
 if (navbar) navbar.classList.add("no-transition");
  if (footer) footer.classList.add("no-transition");

  modal.classList.remove("hidden");
  document.getElementById("closeModal").focus();
}

/**
 * Cierra el modal de detalles del producto.
 */
function cerrarModal() {
    modal.classList.add("hidden");
    navbar?.classList.remove("no-transition");
    footer?.classList.remove("no-transition");
}

/**
 * Maneja el envío del formulario para agregar o editar un producto.
 * @param {Event} ev - El evento de envío del formulario.
 */
async function guardarProductoHandler(ev) {
  ev.preventDefault();
  const imagenFile = imagenArchivoInput.files[0];
  const urlIngresada = imagenURLInput.value.trim();
  const editId = editIndexInput.value;

  let finalImageUrl = urlIngresada;
  if (imagenFile) {
    try {
      finalImageUrl = await fileToBase64(imagenFile);
 } catch (error) {
      console.error("Error al leer el archivo:", error);
 showAlert("❌ Error al leer la imagen local.");
      return;
    }
  } else if (editId && !urlIngresada) {
    const productoExistente = productos.find((p) => p.id === editId);
 finalImageUrl = productoExistente ? productoExistente.imagen : "";
  } else if (!urlIngresada) {
    finalImageUrl = "";
 }

  if (
    !document.getElementById("nombre").value.trim() ||
    parseInt(document.getElementById("precio").value) <= 0
  ) {
    showAlert("El nombre y el precio deben ser válidos.");
 return;
  }

  const productoData = {
    nombre: document.getElementById("nombre").value.trim(),
    categoria: document.getElementById("categoria").value,
    info: document.getElementById("info").value.trim(),
    uso: document.getElementById("uso").value.trim(),
    precio: parseInt(document.getElementById("precio").value) ||
 0,
    imagen: finalImageUrl,
  };

  showLoading();
  try {
    if (editId) {
      await productosRef.child(editId).update(productoData);
 showAlert("✅ Producto actualizado exitosamente.");
    } else {
      await productosRef.push(productoData);
      showAlert("✅ Producto guardado exitosamente.");
 }
    formModal.classList.add("hidden");
    productoForm.reset();
  } catch (error) {
    console.error("Error al guardar en la base de datos:", error);
 showAlert("❌ Error al guardar el producto en Firebase.");
  } finally {
    hideLoading();
 }
}

/**
 * Abre el formulario de producto precargado para edición.
 * @param {Object} producto - El objeto producto a editar.
 */
function abrirFormEditar(producto) {
  formTitle.textContent = "Editar Producto";
  editIndexInput.value = producto.id || "";
  document.getElementById("nombre").value = producto.nombre ||
  "";
 document.getElementById("categoria").value = producto.categoria || "Unguentos";
  document.getElementById("info").value = producto.info || "";
  document.getElementById("uso").value = producto.uso || "";
  document.getElementById("precio").value = producto.precio ||
  0;
 imagenURLInput.value =
    producto.imagen && !producto.imagen.startsWith("data:image")
      ?
 producto.imagen
      : "";
  imagenArchivoInput.value = null;

  formModal.classList.remove("hidden");
  renderCategoriasSelect(productos);
  document.getElementById("nombre").focus();
 }

/**
 * Pide confirmación y elimina un producto de Firebase.
 * @param {Object} producto - El objeto producto a eliminar.
 */
async function eliminarProducto(producto) {
  if (producto.id) {
    const confirmed = await showConfirm(
      `¿Seguro que deseas eliminar **"${producto.nombre}"**?`
    );
 if (confirmed) {
        showLoading();
 try {
        await productosRef.child(producto.id).remove();
        showAlert("Producto eliminado exitosamente.");
 } catch (error) {
        console.error("Error al eliminar producto:", error);
 showAlert("Error al eliminar el producto.");
      } finally {
        hideLoading();
 }
    }
  }
}

// ===================================
// FUNCIONES DE CARRITO Y PAGO (Sin cambios funcionales)
// ===================================

/**
 * Agrega un producto al carrito o incrementa su cantidad.
 * @param {Object} producto - El producto a agregar.
 */
async function agregarAlCarrito(producto) {
  const existe = carrito.find((p) => p.id === producto.id);
 if (existe) existe.cantidad++;
  else carrito.push({ ...producto, cantidad: 1 });

  renderCarrito();
  renderMiniCarrito();
  await showAlert(`"${producto.nombre}" agregado al carrito.`);

  openMiniCart();
 }

/**
 * Renderiza la tabla del carrito en la vista completa.
 */
function renderCarrito() {
  const tbody = document.querySelector("#carritoTabla tbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  let total = 0;
 carrito.forEach((item, idx) => {
    const subtotal = (item.precio || 0) * (item.cantidad || 1);
    total += subtotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(item.nombre)}</td>
      <td><input type="number" min="1" value="${item.cantidad}" class="input-cant" data-index="${idx}" tabindex="0" aria-label="Cantidad de ${escapeHtml(item.nombre)}"></td>
      <td>${formatCOP(item.precio)}</td>
      <td>${formatCOP(subtotal)}</td>
      <td><button class="btn-rem" data-index="${idx}" tabindex="0" aria-label="Remover ${escapeHtml(item.nombre)} del carrito">❌</button></td>
    `;

    tbody.appendChild(tr);
  });
 tbody.querySelectorAll(".input-cant").forEach(input => {
    input.addEventListener("change", (e) => {
        const index = parseInt(e.target.dataset.index);
        const val = parseInt(e.target.value) || 1;
        if (!isNaN(index) && carrito[index]) {
            carrito[index].cantidad = val;
            renderCarrito();
            renderMiniCarrito();
        }

    });
    handleEnterKey(input,
 
    (e) => {
        e.target.dispatchEvent(new Event('change'));
    });
  });
 tbody.querySelectorAll(".btn-rem").forEach(btn => {
    btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);
        if (!isNaN(index)) {
            carrito.splice(index, 1);
            renderCarrito();
            renderMiniCarrito();
        }
    });
  });
 if (totalCarritoElem)
    totalCarritoElem.textContent = `Total: ${formatCOP(total)}`;
  renderMiniCarrito();
 }

/**
 * Renderiza el contenido del sidebar del mini-carrito y actualiza los contadores.
 * FIX: Se elimina la actualización del cartCountNavElem para ocultar el contador del Navbar.
 */
function renderMiniCarrito() {
    // Excluimos cartCountNavElem de la verificación, ya que no se usará.
    if (!miniCartItems || !miniCartTotal || !cartCountFloatingElem) {
        return;
    }

    miniCartItems.innerHTML = '';
    let total = 0;
    let itemCount = 0;
 if (carrito.length === 0) {
        miniCartItems.innerHTML = '<p class="empty-message">Aún no hay productos.</p>';
 } else {
        carrito.forEach((item, index) => {
            const subtotal = (item.precio || 0) * (item.cantidad || 1);
            total += subtotal;
            itemCount += item.cantidad;

            const div = document.createElement("div");
            div.className = "sidebar-item";

         
         div.innerHTML = `
                <div class="item-details">
                    <span class="item-name">${escapeHtml(item.nombre)}</span>
                    <span class="item-price">${formatCOP(subtotal)}</span>

                </div>
                <div class="item-controls">
   
                  <button class="mini-cart-btn-qty" data-action="decrease" data-index="${index}" tabindex="0" aria-label="Disminuir cantidad de ${escapeHtml(item.nombre)}">-</button>
                    <span class="item-qty">${item.cantidad}</span>
                    <button class="mini-cart-btn-qty" data-action="increase" data-index="${index}" tabindex="0"
                    aria-label="Aumentar cantidad de ${escapeHtml(item.nombre)}">+</button>

       
                 <button class="item-remove" data-index="${index}" tabindex="0" aria-label="Eliminar ${escapeHtml(item.nombre)}">✖</button>
                </div>
            `;
 miniCartItems.appendChild(div);
        });

        miniCartItems.querySelectorAll(".mini-cart-btn-qty").forEach(btn => {
            btn.addEventListener("click", handleMiniCartQtyChange);
        });
 miniCartItems.querySelectorAll(".item-remove").forEach(btn => {
            btn.addEventListener("click", handleMiniCartRemove);
        });
 }

    miniCartTotal.textContent = `Total: ${formatCOP(total)}`;
    // Lógica Corregida: SOLO actualiza el contador FLOTANTE (cartCountFloatingElem).
    // Se elimina la manipulación de cartCountNavElem (el contador del Navbar) para ocultarlo.
    const displayStyle = itemCount > 0 ?
    'flex' : 'none';
    
    // cartCountNavElem.textContent = itemCount; <--- ELIMINADO
    cartCountFloatingElem.textContent = itemCount;
    // cartCountNavElem.style.display = displayStyle; <--- ELIMINADO
    cartCountFloatingElem.style.display = displayStyle;
 }

/**
 * Maneja el cambio de cantidad en el mini-carrito.
 * @param {Event} e - El evento de click.
 */
function handleMiniCartQtyChange(e) {
    const index = parseInt(e.target.dataset.index);
    const action = e.target.dataset.action;
    if (isNaN(index) || !carrito[index]) return;
 const item = carrito[index];
    if (action === "increase") {
        item.cantidad++;
 } else if (action === "decrease") {
        if (item.cantidad > 1) {
            item.cantidad--;
 } else {
            carrito.splice(index, 1);
 }
    }
    renderMiniCarrito();
    renderCarrito();
 }

/**
 * Maneja la eliminación de un artículo en el mini-carrito.
 * @param {Event} e - El evento de click.
 */
function handleMiniCartRemove(e) {
    const index = parseInt(e.target.dataset.index);
 if (!isNaN(index)) {
        carrito.splice(index, 1);
        renderMiniCarrito();
        renderCarrito();
 }
}

/**
 * Simula el proceso de pago y vacía el carrito.
 */
function realizarPago() {
    const billetera = document.getElementById("billetera")?.value;
 if (carrito.length === 0) {
      showAlert("Tu carrito está vacío.");
      return;
 }

    if (!billetera || billetera === "") {
      showAlert("Selecciona una billetera virtual.");
 return;
    }

    showAlert(`Pago realizado con ${billetera}. ¡Gracias por tu compra!`);
    carrito = [];
    renderCarrito();
    renderMiniCarrito();
    mostrarVistaProductos();
 }

// ===================================
// INICIALIZACIÓN DE REFERENCIAS Y LISTENERS
// ===================================

/**
 * Obtiene todas las referencias de elementos del DOM.
 */
function setupDOMReferences() {
    // General
    body = document.getElementById("body");
    grid = document.getElementById("productosGrid");
    searchInput = document.getElementById("searchInput");
 categoriaFiltro = document.getElementById("categoriaFiltro");
    btnVistaOriginal = document.getElementById("btnVistaOriginal");
    btnVistaLista = document.getElementById("btnVistaLista");

    // Variables de Navbar y Menú Móvil (ACTUALIZADAS)
    menuToggleBtn = document.querySelector(".menu-toggle");
 navMenu = document.querySelector(".menu");
    logoutLinks = document.querySelectorAll(".logout-btn, .logout-btn-mobile");
    currentPageMobileSpan = document.getElementById("current-page-mobile");
    navLinks = document.querySelectorAll(".menu a");
 // Navbar/Vistas de Carrito
    navbarCartBtn = document.getElementById("toggleCarritoNav");
    floatingCartBtn = document.getElementById("floatingCartBtn");
    cartCountNavElem = document.getElementById("cartCountNav");
    cartCountFloatingElem = document.getElementById("cartCountFloating");
 productosView = document.getElementById("productos-view");
    carritoView = document.getElementById("carrito-view");
    carritoSection = document.getElementById("carrito-section");
    pagoSection = document.getElementById("pago-section");
    goToPagoBtn = document.getElementById("goToPagoBtn");
    backToCartBtn = document.getElementById("backToCartBtn");
 pagarBtn = document.getElementById("pagarBtn");
    totalCarritoElem = document.getElementById("totalCarrito");
    // Sidebar de Mini-Carrito
    backToProductosBtn = document.getElementById("backToProductosBtn");
    miniCartSidebar = document.getElementById("mini-cart-sidebar");
 closeMiniCart = document.getElementById("closeMiniCart");
    miniCartItems = document.getElementById("miniCartItems");
    miniCartTotal = document.getElementById("miniCartTotal");
    viewCartGridBtn = document.getElementById("viewCartGridBtn");
 // Modales y Formularios
    modal = document.getElementById("modal");
    closeModal = document.getElementById("closeModal");
    modalImg = document.getElementById("modalImg");
    modalNombre = document.getElementById("modalNombre");
 modalInfo = document.getElementById("modalInfo");
    modalUso = document.getElementById("modalUso");
    modalPrecio = document.getElementById("modalPrecio");
    contactoBtn = document.getElementById("contactoBtn");
    abrirFormBtn = document.getElementById("abrirFormBtn");
    formModal = document.getElementById("formModal");
 closeForm = document.getElementById("closeForm");
    productoForm = document.getElementById("productoForm");
    editIndexInput = document.getElementById("editIndex");
    formTitle = document.getElementById("formTitle");
    imagenURLInput = document.getElementById("imagen");
    imagenArchivoInput = document.getElementById("imagenArchivo");
 alertModal = document.getElementById("alertModal");
    alertMessage = document.getElementById("alertMessage");
    alertCloseBtn = document.getElementById("alertCloseBtn");
    confirmModal = document.getElementById("confirmModal");
    confirmMessage = document.getElementById("confirmMessage");
    confirmOkBtn = document.getElementById("confirmOkBtn");
 confirmCancelBtn = document.getElementById("confirmCancelBtn");

    // Elementos de la interfaz general
    navbar = document.querySelector(".barra-navegacion");
    footer = document.querySelector(".footer");
 loadingOverlay = document.getElementById("loadingOverlay");

    // Accesibilidad
    floatingAccessibilityBtn = document.getElementById("floatingAccessibilityBtn");
    accessibilityMenu = document.getElementById("accessibility-menu");
    accessibilityContainer = document.querySelector(".accessibility-container");
    toggleContrastBtn = document.getElementById("toggleContrastBtn");
 increaseTextBtn = document.getElementById("increaseTextBtn");
    decreaseTextBtn = document.getElementById("decreaseTextBtn");
    resetTextBtn = document.getElementById("resetTextBtn");
}

/**
 * Asigna todos los event listeners a los elementos del DOM.
 */
function setupEventListeners() {
    // Navegación entre vistas
    if (navbarCartBtn) navbarCartBtn.addEventListener("click", (e) => { e.preventDefault(); mostrarVistaCarrito(); });
 if (floatingCartBtn) floatingCartBtn.addEventListener("click", (e) => { e.preventDefault(); toggleMiniCartSidebar(); });
    if (goToPagoBtn) goToPagoBtn.addEventListener("click", mostrarVistaPago);
    if (backToCartBtn) backToCartBtn.addEventListener("click", mostrarVistaCarrito);
 if (backToProductosBtn) backToProductosBtn.addEventListener("click", mostrarVistaProductos);
    if (closeMiniCart) closeMiniCart.addEventListener("click", () => miniCartSidebar?.classList.remove("open"));
    if (viewCartGridBtn) viewCartGridBtn.addEventListener("click", mostrarVistaCarrito);
 // NUEVOS LISTENERS DE NAVBAR Y MENÚ MÓVIL
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener("click", toggleMobileMenu);
 }
    if (logoutLinks.length > 0) {
        logoutLinks.forEach(link => {
            link.addEventListener("click", handleLogout);
            handleEnterKey(link, handleLogout);
        });
 }
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

    // Filtros y Vistas de Productos
    if (searchInput) searchInput.addEventListener("input", aplicarFiltrosYSort);
 if (categoriaFiltro) categoriaFiltro.addEventListener("change", aplicarFiltrosYSort);
    if (btnVistaOriginal) btnVistaOriginal.addEventListener("click", () => cambiarVista('original'));
    if (btnVistaLista) btnVistaLista.addEventListener("click", () => cambiarVista('lista'));
 // Modal de Producto (Detalles)
    if (closeModal) closeModal.addEventListener("click", cerrarModal);
 if (contactoBtn) contactoBtn.addEventListener("click", () => { window.location.href = "/chat"; });
 // Formulario de Producto (Agregar/Editar)
    if (abrirFormBtn) abrirFormBtn.addEventListener("click", () => {
        formTitle.textContent = "Agregar Producto";
        editIndexInput.value = "";
        productoForm.reset();
        formModal.classList.remove("hidden");
        renderCategoriasSelect(productos);
        document.getElementById("nombre").focus();
    });
 if (closeForm) closeForm.addEventListener("click", () => formModal.classList.add("hidden"));
    if (productoForm) productoForm.addEventListener("submit", guardarProductoHandler);
 // Carrito y Pago
    if (pagarBtn) pagarBtn.addEventListener("click", realizarPago);
 // Accesibilidad
    if (floatingAccessibilityBtn) {
        floatingAccessibilityBtn.addEventListener("click", (e) => {
            if (!accessibilityContainer.classList.contains('is-moving')) {
                toggleAccessibilityMenu();
            } else {
                e.stopPropagation();
                e.preventDefault();
      
       }
        });
        handleEnterKey(floatingAccessibilityBtn, toggleAccessibilityMenu);
 }
    if (toggleContrastBtn) toggleContrastBtn.addEventListener("click", toggleContrast);
    if (increaseTextBtn) increaseTextBtn.addEventListener("click", () => changeFontSize('increase'));
    if (decreaseTextBtn) decreaseTextBtn.addEventListener("click", () => changeFontSize('decrease'));
 if (resetTextBtn) resetTextBtn.addEventListener("click", () => changeFontSize('reset'));
}


/**
 * Función principal de inicialización que se ejecuta al cargar la ventana.
 */
function initApp() {
    // 1. CRÍTICO: Configurar referencias de DOM y Listeners
    setupDOMReferences();
    setupEventListeners();
 // 2. Listener de Firebase Database.
    productosRef.on("value", (snapshot) => {
        showLoading();
        try {
            const val = snapshot.val();
            productos = val ? Object.entries(val).map(([id, p]) => ({ id, ...p })) : [];

            aplicarFiltrosYSort();
            renderCategoriasSelect(productos);
        } finally {
 
             hideLoading();
        }
    });
 // 3. Finalizar inicialización de la interfaz
    document.body.classList.add("loaded");
    document.documentElement.style.setProperty('--font-scale', '1.0');

    mostrarVistaProductos();
    renderMiniCarrito();
 // AGREGADO: Inicialización de Navbar/Accesibilidad
    updateCurrentPageMobile();

    // 4. Inicialización de Accesibilidad (Posicionamiento y Drag)
    if (accessibilityContainer) {
        const setInitialPosition = () => {
            if (localStorage.getItem('accessibility-top') || localStorage.getItem('accessibility-left')) return;
 const offset = 20;
            const originalDisplay = accessibilityContainer.style.display;
            accessibilityContainer.style.display = 'block';

            const elWidth = accessibilityContainer.offsetWidth;
 accessibilityContainer.style.top = (navbar ? navbar.offsetHeight + offset : offset) + 'px';
            accessibilityContainer.style.left = (window.innerWidth - elWidth - offset) + 'px';
 accessibilityContainer.style.display = originalDisplay;
            accessibilityContainer.style.right = 'unset';
        };

        setInitialPosition();

        accessibilityContainer.style.right = 'unset';
        dragElement(accessibilityContainer);
        loadPosition(accessibilityContainer);
 window.addEventListener('resize', () => {
            updateCurrentPageMobile();
            setInitialPosition();
        });
 }

    // 5. SOLUCIÓN AL SALTO: Eliminar la clase no-transition con un pequeño retraso
    setTimeout(() => {
        body?.classList.remove("no-transition");
    }, 50);
 }

let ultimoScroll = 0;
const scrollThreshold = 80;

// Llamar a la función de inicialización al cargar la ventana
window.addEventListener("load", initApp);
 // REEMPLAZO COMPLETO: Listener de scroll para efectos de navegación y footer
window.addEventListener(
  "scroll",
  () => {
    const actualScroll = window.scrollY || document.documentElement.scrollTop;

    closeAccessibilityMenuOnScroll();


    if (
      (modal && !modal.classList.contains("hidden")) ||
      (formModal && !formModal.classList.contains("hidden")) ||
      (alertModal && !alertModal.classList.contains("hidden")) ||
      (confirmModal && !confirmModal.classList.contains("hidden")) ||
      (navMenu && navMenu.classList.contains("open") && window.innerWidth <= 768)
    )
      return;


    // Ocultar barra 
    if (actualScroll > ultimoScroll && actualScroll > scrollThreshold) {
      navbar?.classList.add("oculta");
      navbar?.classList.remove("transparente");

    // Mostrar barra al subir
    } else if (actualScroll < ultimoScroll) {
      navbar?.classList.remove("oculta");
      navbar?.classList.add("transparente");
      clearTimeout(scrollTimeout);
 scrollTimeout = setTimeout(() => {
        navbar?.classList.remove("transparente");
      }, 300);
 }

    // Mostrar barra en la parte superior
    if (actualScroll <= 0) {
      navbar?.classList.remove("oculta");
 navbar?.classList.remove("transparente");
    }

    ultimoScroll = Math.max(actualScroll, 0);

    // Mostrar/ocultar footer
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
 if (window.scrollY >= scrollMax - 5) footer?.classList.add("visible");
    else footer?.classList.remove("visible");


  },
  { passive: true }
);
 // REEMPLAZO/ACTUALIZACIÓN: Listener para cerrar modales y menús al hacer clic fuera
window.addEventListener("click", function (e) {
  const modales = document.querySelectorAll(".modal");
  modales.forEach((modal) => {
    if (e.target === modal) {
      if (modal.id !== "alertModal" && modal.id !== "confirmModal") {
        modal.classList.add("hidden");
      }
    }
  });

  // Lógica para cerrar el menú de accesibilidad al hacer clic fuera (ACTUALIZADO)
  if (accessibilityMenu && accessibilityMenu.classList.contains('open') &&
  !isMenuClosingByScroll) {

      if (!e.target.closest('.accessibility-container')) {
          toggleAccessibilityMenu();
      }
  }

  // Lógica para cerrar menú móvil al hacer clic fuera (ACTUALIZADO)
  if (navMenu && navMenu.classList.contains('open') && window.innerWidth <= 768) {
      if (!e.target.closest('.barra-navegacion') && !e.target.closest('.accessibility-container')) {
             toggleMobileMenu();
      }
  }

});