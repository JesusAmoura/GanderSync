// =====================
// CALENDARIO FULLCALENDAR
// =====================
document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  let selectedEvent = null;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "es",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
    },
    selectable: true,
    editable: true,
    events: [
      { title: "Lanzamiento nueva versión", start: "2025-08-25" },
      { title: "Mantenimiento del sistema", start: "2025-08-28", end: "2025-08-29" },
      { title: "Reunión de equipo", start: "2025-08-30T10:00:00" },
    ],
    dateClick(info) {
      document.getElementById("start").value = info.dateStr;
    },
    eventClick(info) {
      selectedEvent = info.event;
      abrirModal(info.event);
    },
  });

  calendar.render();

  // =====================
  // FORMULARIO PARA AGREGAR EVENTOS
  // =====================
  const form = document.getElementById("eventForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;

    if (title && start) {
      calendar.addEvent({
        title: title,
        start: start,
        end: end || null,
      });

      form.reset();
      alert("Evento agregado al calendario ✅");
    }
  });

  // =====================
  // MODAL EDITAR / ELIMINAR
  // =====================
  const modal = document.getElementById("eventModal");
  const closeBtn = document.querySelector(".close");
  const editForm = document.getElementById("editForm");
  const deleteBtn = document.getElementById("deleteBtn");

  function abrirModal(evento) {
    modal.style.display = "flex";
    document.getElementById("editTitle").value = evento.title;
    document.getElementById("editStart").value = evento.startStr.split("T")[0];
    document.getElementById("editEnd").value = evento.end ? evento.endStr.split("T")[0] : "";
  }

  closeBtn.onclick = function () {
    modal.style.display = "none";
    selectedEvent = null;
  };

  window.onclick = function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
      selectedEvent = null;
    }
  };

  // Guardar cambios en evento
  editForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (selectedEvent) {
      selectedEvent.setProp("title", document.getElementById("editTitle").value);
      selectedEvent.setStart(document.getElementById("editStart").value);
      selectedEvent.setEnd(document.getElementById("editEnd").value || null);
      alert("Evento actualizado ✅");
    }
    modal.style.display = "none";
    selectedEvent = null;
  });

  // Eliminar evento
  deleteBtn.addEventListener("click", function () {
    if (selectedEvent) {
      selectedEvent.remove();
      alert("Evento eliminado ❌");
    }
    modal.style.display = "none";
    selectedEvent = null;
  });
});

// =====================
// EFECTO DE CARGA SUAVE
// =====================
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// =====================
// NAVBAR Y FOOTER INTERACTIVOS
// =====================
const navbar = document.querySelector(".barra-navegacion");
const footer = document.querySelector(".footer");
let ultimoScroll = 0;
let scrollTimeout;

window.addEventListener("scroll", () => {
  const actualScroll = window.scrollY;

  // Ocultar navbar al bajar
  if (actualScroll > ultimoScroll && actualScroll > 100) {
    navbar.classList.add("oculta");
    navbar.classList.remove("transparente");
  }
  // Mostrar navbar al subir
  else if (actualScroll < ultimoScroll) {
    navbar.classList.remove("oculta");
    navbar.classList.add("transparente");

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      navbar.classList.remove("transparente");
    }, 300);
  }

  // Si está en la parte superior
  if (actualScroll <= 0) {
    navbar.classList.remove("oculta");
    navbar.classList.remove("transparente");
  }

  ultimoScroll = actualScroll <= 0 ? 0 : actualScroll;

  // FOOTER visible al llegar al final
  const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
  if (window.scrollY >= scrollMax - 5) {
    footer.classList.add("visible");
  } else {
    footer.classList.remove("visible");
  }
});
