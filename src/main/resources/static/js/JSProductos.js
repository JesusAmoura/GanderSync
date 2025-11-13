// ------------------ REFERENCIA FIREBASE ------------------
const productosRef = firebase.database().ref("productos");
// const storageRef = firebase.storage().ref(); // ELIMINADO: No se usa Storage

// ------------------ VARIABLES GLOBALES ------------------
let productos = [];
let carrito = [];
let scrollTimeout;

// ------------------ SELECTORES ------------------
const grid = document.getElementById("productosGrid");
const searchInput = document.getElementById("searchInput");
const categoriaFiltro = document.getElementById("categoriaFiltro");

// Selectores para botones de vista (ASUME que estos IDs están en tu HTML)
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

// Selectores para Alertas y Confirmaciones
const alertModal = document.getElementById("alertModal");
const alertMessage = document.getElementById("alertMessage");
const alertCloseBtn = document.getElementById("alertCloseBtn");

const confirmModal = document.getElementById("confirmModal");
const confirmMessage = document.getElementById("confirmMessage");
const confirmOkBtn = document.getElementById("confirmOkBtn");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");

const chatBox = document.getElementById("chatBox");
const closeChat = document.getElementById("closeChat");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendMsg = document.getElementById("sendMsg");

const pagarBtn = document.getElementById("pagarBtn");
const totalCarritoElem = document.getElementById("totalCarrito");

const navbar = document.querySelector(".barra-navegacion");
const footer = document.querySelector(".footer");

// ------------------ FUNCIONES AUXILIARES ------------------
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
  if (alertMessage && alertModal) {
    alertMessage.textContent = message;
    alertModal.classList.remove("hidden");
  } else {
    console.error("No se encontró el modal de alerta.");
  }
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

    const okListener = () => {
      confirmModal.classList.add("hidden");
      resolve(true);
      cleanup();
    };

    const cancelListener = () => {
      confirmModal.classList.add("hidden");
      resolve(false);
      cleanup();
    };

    const cleanup = () => {
      confirmOkBtn.removeEventListener("click", okListener);
      confirmCancelBtn.removeEventListener("click", cancelListener);
    };

    confirmOkBtn.addEventListener("click", okListener);
    confirmCancelBtn.addEventListener("click", cancelListener);
  });
}

if (alertCloseBtn) {
  alertCloseBtn.addEventListener("click", () => {
    alertModal.classList.add("hidden");
  });
}

// ------------------ FILTROS Y BÚSQUEDA ------------------
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

// ------------------ FIREBASE: LECTURA EN TIEMPO REAL ------------------
productosRef.on("value", (snapshot) => {
  const val = snapshot.val();
  productos = val ? Object.entries(val).map(([id, p]) => ({ id, ...p })) : [];
  aplicarFiltrosYSort();
});

// ------------------ RENDER DE PRODUCTOS ------------------
function renderProductos(lista) {
  if (!grid) return;
  grid.innerHTML = "";

  const arr = Array.isArray(lista) ? lista : [];
  arr.forEach((producto) => {
    const card = document.createElement("div");
    card.className = "card";
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
          <button class="btn-agregar">🛒</button>
          <button class="btn-editar">✏️</button>
          <button class="btn-eliminar">🗑️</button>
          <button class="btn-ver">🔍</button>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      abrirModal(producto);
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

// ------------------ MODAL DETALLE ------------------
function abrirModal(producto) {
  modalImg.src = producto.imagen || "";
  modalNombre.textContent = producto.nombre || "";
  modalInfo.textContent = producto.info || "";
  modalUso.textContent = producto.uso || "";
  modalPrecio.textContent = formatCOP(producto.precio || 0);

  if (navbar) navbar.classList.add("no-transition");
  if (footer) footer.classList.add("no-transition");

  modal.classList.remove("hidden");
}

if (closeModal) {
  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
    navbar?.classList.remove("no-transition");
    footer?.classList.remove("no-transition");
  });
}

if (contactoBtn) {
  contactoBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    chatBox.classList.remove("hidden");
  });
}

// ------------------ CRUD ------------------
if (abrirFormBtn) {
  abrirFormBtn.addEventListener("click", () => {
    formTitle.textContent = "Agregar Producto";
    editIndexInput.value = "";
    productoForm.reset();
    formModal.classList.remove("hidden");
  });
}

if (closeForm) closeForm.addEventListener("click", () => formModal.classList.add("hidden"));

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

// ------------------ CARRITO ------------------
function agregarAlCarrito(producto) {
  const existe = carrito.find((p) => p.id === producto.id);
  if (existe) existe.cantidad++;
  else carrito.push({ ...producto, cantidad: 1 });
  renderCarrito();
  showAlert(`"${producto.nombre}" agregado al carrito.`);
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
      <td><input type="number" min="1" value="${item.cantidad}" class="input-cant"></td>
      <td>${formatCOP(item.precio)}</td>
      <td>${formatCOP(subtotal)}</td>
      <td><button class="btn-rem">❌</button></td>
    `;

    tr.querySelector(".input-cant").addEventListener("change", (e) => {
      const val = parseInt(e.target.value) || 1;
      carrito[idx].cantidad = val;
      renderCarrito();
    });

    tr.querySelector(".btn-rem").addEventListener("click", () => {
      carrito.splice(idx, 1);
      renderCarrito();
    });

    tbody.appendChild(tr);
  });

  if (totalCarritoElem)
    totalCarritoElem.textContent = `Total: ${formatCOP(total)}`;
}

// ------------------ CAMBIO DE VISTA ------------------
function cambiarVista(tipo) {
  if (!grid) return;
  grid.classList.remove("vista-original", "vista-lista");
  const clase = tipo === "lista" ? "vista-lista" : "vista-original";
  grid.classList.add(clase);
}

// ------------------ CHAT ------------------
if (closeChat) closeChat.addEventListener("click", () => chatBox.classList.add("hidden"));

if (sendMsg) {
  sendMsg.addEventListener("click", () => {
    const msg = chatInput.value.trim();
    if (!msg) return;
    const userMsg = document.createElement("div");
    userMsg.className = "message cliente";
    userMsg.textContent = msg;
    chatMessages.appendChild(userMsg);
    chatInput.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      const resp = document.createElement("div");
      resp.className = "message vendedor";
      resp.textContent = "Gracias por tu mensaje, pronto te responderemos.";
      chatMessages.appendChild(resp);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 700);
  });
}

// ------------------ PAGO ------------------
if (pagarBtn) {
  pagarBtn.addEventListener("click", () => {
    const billetera = document.getElementById("billetera")?.value;
    if (!billetera) {
      showAlert("Selecciona una billetera virtual.");
      return;
    }
    if (carrito.length === 0) {
      showAlert("Tu carrito está vacío.");
      return;
    }

    showAlert(`Pago realizado con ${billetera}. ¡Gracias por tu compra!`);
    carrito = [];
    renderCarrito();
  });
}

// ------------------ NAVBAR / FOOTER ------------------
let ultimoScroll = 0;
const scrollThreshold = 80;

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

window.addEventListener(
  "scroll",
  () => {
    const actualScroll = window.scrollY || document.documentElement.scrollTop;

    if (
      (modal && !modal.classList.contains("hidden")) ||
      (formModal && !formModal.classList.contains("hidden")) ||
      (alertModal && !alertModal.classList.contains("hidden")) ||
      (confirmModal && !confirmModal.classList.contains("hidden"))
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
});

// ------------------ LISTENERS DE VISTA Y FILTROS ------------------
if (searchInput) searchInput.addEventListener("input", aplicarFiltrosYSort);
if (categoriaFiltro) categoriaFiltro.addEventListener("change", aplicarFiltrosYSort);

// Listeners para cambiar la vista
if (btnVistaOriginal) btnVistaOriginal.addEventListener("click", () => cambiarVista('original'));
if (btnVistaLista) btnVistaLista.addEventListener("click", () => cambiarVista('lista'));

// ------------------ INICIO ------------------
renderCarrito();
