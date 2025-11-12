// =====================
// SISTEMA DE OFERTAS
// =====================
const form = document.getElementById('uploadForm');
const grid = document.getElementById('ofertasGrid');

// Cargar ofertas desde localStorage
let ofertas = JSON.parse(localStorage.getItem('ofertas')) || [];
let editando = null; // Índice de la oferta que se está editando

// Guardar en localStorage
function guardarLocal() {
  localStorage.setItem('ofertas', JSON.stringify(ofertas));
}

// Renderizar las ofertas en el grid
function renderOfertas() {
  grid.innerHTML = '';
  ofertas.forEach((oferta, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <img src="${oferta.imagen}" alt="${oferta.nombre}">
      <h3>${oferta.nombre}</h3>
      <p><del>$${oferta.precioOriginal}</del> <strong>$${oferta.precioOferta}</strong></p>
      <div class="acciones">
        <button class="editar" onclick="editarOferta(${index})">✏️ Editar</button>
        <button class="eliminar" onclick="eliminarOferta(${index})">🗑️ Eliminar</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Manejar el envío del formulario
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nombre = form.querySelector('input[placeholder="Nombre del producto"]').value.trim();
  const precioOriginal = form.querySelector('input[placeholder="Precio original"]').value;
  const precioOferta = form.querySelector('input[placeholder="Precio rebajado"]').value;
  const archivo = form.querySelector('input[type="file"]').files[0];
  const boton = form.querySelector('button[type="submit"]');

  // Función auxiliar para limpiar formulario
  const resetForm = () => {
    form.reset();
    editando = null;
    boton.textContent = "Subir Producto";
    boton.style.background = "#285430";
  };

  // Si estamos editando una oferta existente
  if (editando !== null) {
    const oferta = ofertas[editando];

    const actualizarCampos = (nuevaImg = oferta.imagen) => {
      oferta.nombre = nombre;
      oferta.precioOriginal = precioOriginal;
      oferta.precioOferta = precioOferta;
      oferta.imagen = nuevaImg;
      ofertas[editando] = oferta;

      guardarLocal();
      renderOfertas();
      resetForm();
    };

    // Si hay nueva imagen, reemplazar
    if (archivo) {
      const reader = new FileReader();
      reader.onload = () => actualizarCampos(reader.result);
      reader.readAsDataURL(archivo);
    } else {
      actualizarCampos();
    }

    return;
  }

  // Agregar nueva oferta
  if (!archivo) {
    alert("Debes subir una imagen del producto.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function() {
    const nuevaOferta = {
      nombre,
      precioOriginal,
      precioOferta,
      imagen: reader.result
    };

    ofertas.push(nuevaOferta);
    guardarLocal();
    renderOfertas();
    resetForm();
  };
  reader.readAsDataURL(archivo);
});

// Eliminar oferta
function eliminarOferta(index) {
  if (confirm("¿Seguro que deseas eliminar esta oferta?")) {
    ofertas.splice(index, 1);
    guardarLocal();
    renderOfertas();
  }
}

// Editar oferta
function editarOferta(index) {
  const oferta = ofertas[index];
  form.querySelector('input[placeholder="Nombre del producto"]').value = oferta.nombre;
  form.querySelector('input[placeholder="Precio original"]').value = oferta.precioOriginal;
  form.querySelector('input[placeholder="Precio rebajado"]').value = oferta.precioOferta;

  editando = index;
  const boton = form.querySelector('button[type="submit"]');
  boton.textContent = "Actualizar Producto";
  boton.style.background = "#f39c12";
}

// Render inicial
renderOfertas();

// =====================
// EFECTO DE CARGA SUAVE
// =====================
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// =====================
// NAVBAR Y FOOTER INTERACTIVOS
// =====================
const navbar = document.querySelector('.barra-navegacion');
const footer = document.querySelector('.footer');
let ultimoScroll = 0;
let scrollTimeout;

window.addEventListener('scroll', () => {
  const actualScroll = window.scrollY;

  // Ocultar navbar al bajar
  if (actualScroll > ultimoScroll && actualScroll > 100) {
    navbar.classList.add('oculta');
    navbar.classList.remove('transparente');
  }
  // Mostrar navbar al subir
  else if (actualScroll < ultimoScroll) {
    navbar.classList.remove('oculta');
    navbar.classList.add('transparente');

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      navbar.classList.remove('transparente');
    }, 300);
  }

  ultimoScroll = actualScroll <= 0 ? 0 : actualScroll;

  // FOOTER visible al llegar al final
  const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
  if (window.scrollY >= scrollMax - 5) {
    footer.classList.add('visible');
  } else {
    footer.classList.remove('visible');
  }
});
