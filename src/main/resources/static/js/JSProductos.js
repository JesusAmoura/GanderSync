const productosRef = db.ref("productos");
let productos = [];
let carrito = [];
let scrollTimeout;

const body = document.getElementById("body");
const grid = document.getElementById("productosGrid");
const searchInput = document.getElementById("searchInput");
const categoriaFiltro = document.getElementById("categoriaFiltro");

const btnVistaOriginal = document.getElementById("btnVistaOriginal"); 
const btnVistaLista = document.getElementById("btnVistaLista");

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalImg = document.getElementById("modalImg");
const modalNombre = document.getElementById("modalNombre");
const modalInfo = document.getElementById("modalInfo");
const modalUso = document.getElementById("modalUso");
const modalPrecio = document.getElementById("modalPrecio");
const contactoBtn = document.getElementById("contactoBtn");

const abrirFormBtn = document.getElementById("abrirFormBtn");
const formModal = document.getElementById("formModal");
const closeForm = document.getElementById("closeForm");
const productoForm = document.getElementById("productoForm");
const editIndexInput = document.getElementById("editIndex");
const formTitle = document.getElementById("formTitle");

const imagenURLInput = document.getElementById("imagen");
const imagenArchivoInput = document.getElementById("imagenArchivo");

const alertModal = document.getElementById("alertModal");
const alertMessage = document.getElementById("alertMessage");
const alertCloseBtn = document.getElementById("alertCloseBtn");

const confirmModal = document.getElementById("confirmModal");
const confirmMessage = document.getElementById("confirmMessage");
const confirmOkBtn = document.getElementById("confirmOkBtn");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");

const toggleCarritoNav = document.getElementById("toggleCarritoNav"); 
const floatingCartBtn = document.getElementById("floatingCartBtn"); 

const cartCountNavElem = document.getElementById("cartCountNav"); 
const cartCountFloatingElem = document.getElementById("cartCountFloating"); 

const productosView = document.getElementById("productos-view"); 
const carritoView = document.getElementById("carrito-view"); 
const carritoSection = document.getElementById("carrito-section"); 
const pagoSection = document.getElementById("pago-section"); 
const goToPagoBtn = document.getElementById("goToPagoBtn");
const backToCartBtn = document.getElementById("backToCartBtn");
const pagarBtn = document.getElementById("pagarBtn"); 
const totalCarritoElem = document.getElementById("totalCarrito");
const backToProductosBtn = document.getElementById("backToProductosBtn"); 

const miniCartSidebar = document.getElementById("mini-cart-sidebar");
const closeMiniCart = document.getElementById("closeMiniCart");
const miniCartItems = document.getElementById("miniCartItems");
const miniCartTotal = document.getElementById("miniCartTotal");
const viewCartGridBtn = document.getElementById("viewCartGridBtn"); 

const navbar = document.querySelector(".barra-navegacion");
const footer = document.querySelector(".footer");

const floatingAccessibilityBtn = document.getElementById("floatingAccessibilityBtn");
const accessibilitySidebar = document.getElementById("accessibility-sidebar");
const closeAccessibility = document.getElementById("closeAccessibility");
const toggleContrastBtn = document.getElementById("toggleContrastBtn");
const increaseTextBtn = document.getElementById("increaseTextBtn");
const decreaseTextBtn = document.getElementById("decreaseTextBtn");

const FONT_SCALE_STEP = 0.1;
const FONT_SCALE_MAX = 1.5;
const FONT_SCALE_MIN = 0.8;

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

function mostrarVistaProductos() {
    productosView?.classList.remove("hidden");
    carritoView?.classList.add("hidden");
    miniCartSidebar?.classList.remove("open"); 
    if (floatingCartBtn) floatingCartBtn.style.display = 'flex'; 
}

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

function mostrarVistaPago() {
    carritoSection?.classList.add("hidden");
    pagoSection?.classList.remove("hidden");
    document.getElementById("billetera")?.focus();
}

if (toggleCarritoNav) {
    toggleCarritoNav.addEventListener("click", (e) => {
        e.preventDefault();
        mostrarVistaCarrito(); 
    });
}

if (floatingCartBtn) {
    floatingCartBtn.addEventListener("click", (e) => {
        e.preventDefault();
        toggleMiniCartSidebar();
    });
    handleEnterKey(floatingCartBtn, toggleMiniCartSidebar);
}

if (goToPagoBtn) {
    goToPagoBtn.addEventListener("click", mostrarVistaPago);
}

if (backToCartBtn) {
    backToCartBtn.addEventListener("click", mostrarVistaCarrito);
}

if (backToProductosBtn) {
    backToProductosBtn.addEventListener("click", mostrarVistaProductos);
}

if (closeMiniCart) {
    closeMiniCart.addEventListener("click", () => miniCartSidebar?.classList.remove("open"));
    handleEnterKey(closeMiniCart, () => miniCartSidebar?.classList.remove("open"));
}
if (viewCartGridBtn) {
    viewCartGridBtn.addEventListener("click", mostrarVistaCarrito);
}

function openMiniCart() {
    if (carritoView?.classList.contains("hidden")) { 
        miniCartSidebar?.classList.add("open");
        renderMiniCarrito();
    }
}

function toggleMiniCartSidebar() {
    if (!carritoView?.classList.contains("hidden")) return;
    miniCartSidebar?.classList.toggle("open");
    renderMiniCarrito();
}

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

productosRef.on("value", (snapshot) => {
  const val = snapshot.val();
  productos = val ? Object.entries(val).map(([id, p]) => ({ id, ...p })) : [];
  aplicarFiltrosYSort();
  renderCategoriasSelect(productos); 
});

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


function renderProductos(lista) {
  if (!grid) return;
  grid.innerHTML = "";

  const arr = Array.isArray(lista) ? lista : [];
  arr.forEach((producto) => {
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
        <p class="card-info">${escapeHtml(producto.info || "")}</p>
        <p><strong>Uso:</strong> ${escapeHtml(producto.uso || "")}</p>
        <p><strong>Precio:</strong> ${formatCOP(producto.precio || 0)}</p>
        <div class="card-actions">
          <button class="btn-agregar" tabindex="0">🛒</button>
          <button class="btn-editar" tabindex="0">✏️</button>
          <button class="btn-eliminar" tabindex="0">🗑️</button>
          <button class="btn-ver" tabindex="0">🔍</button>
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
    card.querySelector(".btn-editar").addEventListener("click", () =>
      abrirFormEditar(producto)
    );
    card.querySelector(".btn-eliminar").addEventListener("click", () =>
      eliminarProducto(producto)
    );
    card.querySelector(".btn-ver").addEventListener("click", () =>
      abrirModal(producto)
    );

    grid.appendChild(card);
  });
}

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

if (closeModal) {
  closeModal.addEventListener("click", cerrarModal);
  handleEnterKey(closeModal, cerrarModal);
}
function cerrarModal() {
    modal.classList.add("hidden");
    navbar?.classList.remove("no-transition");
    footer?.classList.remove("no-transition");
}


if (contactoBtn) {
  contactoBtn.addEventListener("click", () => {
      window.location.href = "/gandersync/chat";
  });
}
// -----------------------------------------------------

if (abrirFormBtn) {
  abrirFormBtn.addEventListener("click", () => {
    formTitle.textContent = "Agregar Producto";
    editIndexInput.value = "";
    productoForm.reset();
    formModal.classList.remove("hidden");
    renderCategoriasSelect(productos); 
    document.getElementById("nombre").focus();
  });
}

if (closeForm) {
    closeForm.addEventListener("click", () => formModal.classList.add("hidden"));
    handleEnterKey(closeForm, () => formModal.classList.add("hidden"));
}

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
    precio: parseInt(document.getElementById("precio").value) || 0,
    imagen: finalImageUrl,
  };

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
  }
}

if (productoForm) productoForm.addEventListener("submit", guardarProductoHandler);

function abrirFormEditar(producto) {
  formTitle.textContent = "Editar Producto";
  editIndexInput.value = producto.id || "";
  document.getElementById("nombre").value = producto.nombre || "";
  document.getElementById("categoria").value = producto.categoria || "Unguentos";
  document.getElementById("info").value = producto.info || "";
  document.getElementById("uso").value = producto.uso || "";
  document.getElementById("precio").value = producto.precio || 0;

  imagenURLInput.value =
    producto.imagen && !producto.imagen.startsWith("data:image")
      ? producto.imagen
      : "";
  imagenArchivoInput.value = null;

  formModal.classList.remove("hidden");
  renderCategoriasSelect(productos); 
  document.getElementById("nombre").focus();
}

async function eliminarProducto(producto) {
  if (producto.id) {
    const confirmed = await showConfirm(
      `¿Seguro que deseas eliminar "${producto.nombre}"?`
    );

    if (confirmed) {
      try {
        await productosRef.child(producto.id).remove();
        showAlert("Producto eliminado exitosamente.");
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        showAlert("Error al eliminar el producto.");
      }
    }
  }
}

async function agregarAlCarrito(producto) {
  const existe = carrito.find((p) => p.id === producto.id);
  if (existe) existe.cantidad++;
  else carrito.push({ ...producto, cantidad: 1 });
  
  renderCarrito();
  renderMiniCarrito(); 
  
  await showAlert(`"${producto.nombre}" agregado al carrito.`);
  
  openMiniCart();
}

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
      <td><input type="number" min="1" value="${item.cantidad}" class="input-cant" data-index="${idx}" tabindex="0"></td>
      <td>${formatCOP(item.precio)}</td>
      <td>${formatCOP(subtotal)}</td>
      <td><button class="btn-rem" data-index="${idx}" tabindex="0">❌</button></td>
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
    handleEnterKey(input, (e) => {
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

function renderMiniCarrito() {
    if (!miniCartItems || !miniCartTotal || !cartCountNavElem || !cartCountFloatingElem) {
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
                    <button class="mini-cart-btn-qty" data-action="decrease" data-index="${index}" tabindex="0">-</button>
                    <span class="item-qty">${item.cantidad}</span>
                    <button class="mini-cart-btn-qty" data-action="increase" data-index="${index}" tabindex="0">+</button>
                    <button class="item-remove" data-index="${index}" tabindex="0">✖</button>
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
    
    const displayStyle = itemCount > 0 ? 'flex' : 'none'; 
    cartCountNavElem.textContent = itemCount;
    cartCountFloatingElem.textContent = itemCount;
    cartCountNavElem.style.display = displayStyle;
    cartCountFloatingElem.style.display = displayStyle;
}

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

function handleMiniCartRemove(e) {
    const index = parseInt(e.target.dataset.index);
    if (!isNaN(index)) {
        carrito.splice(index, 1);
        renderMiniCarrito();
        renderCarrito(); 
    }
}

function cambiarVista(tipo) {
  if (!grid) return;
  grid.classList.remove("vista-original", "vista-lista");
  const clase = tipo === "lista" ? "vista-lista" : "vista-original";
  grid.classList.add(clase);
}



if (pagarBtn) {
  pagarBtn.addEventListener("click", realizarPago);
}

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

let ultimoScroll = 0;
const scrollThreshold = 80;

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
  document.documentElement.style.setProperty('--font-scale', '1.0'); 
  mostrarVistaProductos(); 
  renderMiniCarrito(); 
});

window.addEventListener(
  "scroll",
  () => {
    const actualScroll = window.scrollY || document.documentElement.scrollTop;

    if (
      (modal && !modal.classList.contains("hidden")) ||
      (formModal && !formModal.classList.contains("hidden")) ||
      (alertModal && !alertModal.classList.contains("hidden")) ||
      (confirmModal && !confirmModal.classList.contains("hidden")) ||
      (accessibilitySidebar && accessibilitySidebar.classList.contains("open"))
    )
      return;

    if (actualScroll > ultimoScroll && actualScroll > scrollThreshold) {
      navbar?.classList.add("oculta");
      navbar?.classList.remove("transparente");
    } else if (actualScroll < ultimoScroll) {
      navbar?.classList.remove("oculta");
      navbar?.classList.add("transparente");
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        navbar?.classList.remove("transparente");
      }, 300);
    }

    if (actualScroll <= 0) {
      navbar?.classList.remove("oculta");
      navbar?.classList.remove("transparente");
    }

    ultimoScroll = Math.max(actualScroll, 0);

    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= scrollMax - 5) footer?.classList.add("visible");
    else footer?.classList.remove("visible");
  },
  { passive: true }
);

window.addEventListener("click", function (e) {
  const modales = document.querySelectorAll(".modal");
  modales.forEach((modal) => {
    if (e.target === modal) {
      if (modal.id !== "alertModal" && modal.id !== "confirmModal") {
        modal.classList.add("hidden");
      }
    }
  });
  
  if (accessibilitySidebar && accessibilitySidebar.classList.contains('open')) {
      if (!e.target.closest('.accessibility-sidebar') && e.target !== floatingAccessibilityBtn) {
          accessibilitySidebar.classList.remove('open');
      }
  }
});

if (searchInput) searchInput.addEventListener("input", aplicarFiltrosYSort);
if (categoriaFiltro) categoriaFiltro.addEventListener("change", aplicarFiltrosYSort);

if (btnVistaOriginal) btnVistaOriginal.addEventListener("click", () => cambiarVista('original'));
if (btnVistaLista) btnVistaLista.addEventListener("click", () => cambiarVista('lista'));

renderCarrito();
renderMiniCarrito();