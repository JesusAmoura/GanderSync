// JSOfertas.js - Script Completo para Gestión de Ofertas
// Incluye Navbar, Accesibilidad Flotante y Lógica de Chat (WebSockets).

// ===================================
// VARIABLES GLOBALES DEL DOM (MODALES Y GENERALES)
// ===================================
const body = document.getElementById("body") || document.body; // Asegurar body

// Elementos de Modales de Alerta/Confirmación (Placeholders)
const alertModal = document.getElementById("alertModal"); 
const alertMessage = document.getElementById("alertMessage");
const alertCloseBtn = document.getElementById("alertCloseBtn");
const confirmModal = document.getElementById("confirmModal");
const confirmMessage = document.getElementById("confirmMessage");
const confirmOkBtn = document.getElementById("confirmOkBtn");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");


// ===================================
// VARIABLES GENERALES Y ACCESIBILIDAD
// ===================================

// Elementos del Navbar
const navbar = document.querySelector(".barra-navegacion");
const footer = document.querySelector(".footer");
const menuToggleBtn = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".menu"); 
const logoutLinks = document.querySelectorAll(".logout-btn, .logout-btn-mobile"); 
const currentPageMobileSpan = document.getElementById("current-page-mobile");
const navLinks = document.querySelectorAll(".menu a");

// Elementos de Accesibilidad 
const floatingAccessibilityBtn = document.getElementById("floatingAccessibilityBtn");
const accessibilityContainer = document.querySelector(".accessibility-container"); 
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
let isMenuClosingByScroll = false; 

// Función de utilidad para detectar móvil
const isMobile = () => window.innerWidth <= 768;


// ===================================
// VARIABLES ESPECÍFICAS DEL CHAT 
// ===================================
let stompClient = null;
const chatMessages = document.getElementById("chat-messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const disconnectBtn = document.getElementById("disconnectBtn");

// ⭐ ESTOS IDs DEBEN SER CONFIGURADOS DINÁMICAMENTE EN UN ENTORNO REAL
const CHAT_ID = "chat-cliente-vendedor-123"; 
const CLIENT_ID = "Cliente_456"; 

// ===================================
// FUNCIONES DE UTILIDAD Y MODALES 
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
        if (alertModal && alertMessage && alertCloseBtn) {
            console.log("ALERTA (UI):", message);
            resolve();
        } else {
            console.warn("ALERTA (Simulación):", message);
            resolve();
        }
    });
}

function showConfirm(message) {
    return new Promise((resolve) => {
        if (confirmModal && confirmMessage && confirmOkBtn && confirmCancelBtn) {
            console.log("CONFIRMACIÓN (UI):", message);
            resolve(false); 
        } else {
            const result = confirm(message);
            resolve(result);
        }
    });
}


// ===================================
// FUNCIONALIDAD DE ACCESIBILIDAD (FLOTANTE/ARRASTRABLE)
// ===================================

function toggleAccessibilityMenu() {
    const isOpen = accessibilityMenu?.classList.toggle("open");
    if (accessibilityMenu) {
        accessibilityMenu.toggleAttribute('hidden', !isOpen);
        floatingAccessibilityBtn.setAttribute('aria-expanded', isOpen);
    }
}

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
        body?.classList.remove("high-contrast");
        if (toggleContrastBtn) {
            toggleContrastBtn.setAttribute('aria-label', "Alto Contraste: DESACTIVADO");
        }
    }

    root.style.setProperty('--font-scale', currentScale.toFixed(2));
}


// ===================================
// FUNCIONALIDAD DRAGGABLE PARA EL CONTENEDOR DE ACCESIBILIDAD 
// ===================================

if (accessibilityContainer) {
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
            if (e.target !== dragHandle || (accessibilityMenu && accessibilityMenu.classList.contains('open'))) return;

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

    function setInitialPosition() {
        const offset = 20;
        
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

// Event Listeners de Accesibilidad 
if (floatingAccessibilityBtn) {
    floatingAccessibilityBtn.addEventListener("click", (e) => {
        if (accessibilityContainer && !accessibilityContainer.classList.contains('is-moving')) {
            toggleAccessibilityMenu();
        } else {
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

function toggleMobileMenu() {
    const isOpen = navMenu?.classList.toggle("open");
    if (menuToggleBtn) {
        menuToggleBtn.setAttribute('aria-expanded', isOpen);
    }
    body.style.overflowY = isOpen ? 'hidden' : 'auto';
}

function updateCurrentPageMobile() {
    if (currentPageMobileSpan) {
        const activeLink = document.querySelector(".menu a.active");
        if (activeLink) {
            let pageName = activeLink.textContent.replace('🛒', '').trim();
            currentPageMobileSpan.textContent = pageName;
        } else {
            currentPageMobileSpan.textContent = document.title.split('-')[0].trim() || 'GanderSync';
        }
    }
}

async function handleLogout(e) {
    e.preventDefault();
    const result = await showConfirm("¿Estás seguro de que deseas cerrar tu sesión?"); 
    if (result) {
        console.log("Sesión cerrada (Simulación)");
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
// ANIMACIÓN DE NAVBAR Y FOOTER 
// ===================================
const scrollThreshold = 80;

window.addEventListener("scroll", () => {
    
    closeAccessibilityMenuOnScroll(); 

    if (navMenu && navMenu.classList.contains("open") && window.innerWidth <= 768) {
        // No cerramos el menú móvil si está en scroll.
    }
    
    // Bloquear animación si hay modales de alerta/confirmación abiertos 
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
    if (isMenuClosingByScroll) {
        return;
    }
    
    // Cerrar menú de Accesibilidad (Flotante)
    if (accessibilityMenu && accessibilityMenu.classList.contains('open')) {
        if (!e.target.closest('.accessibility-container')) {
            toggleAccessibilityMenu(); 
        }
    }
    
    // Cerrar menú móvil al hacer clic fuera
    if (navMenu && navMenu.classList.contains('open') && window.innerWidth <= 768) {
        if (!e.target.closest('.barra-navegacion') && !e.target.closest('.accessibility-container')) {
             toggleMobileMenu();
        }
    }
});


// ===================================
// LÓGICA DE WEBSOCKETS (CHAT) - CORREGIDO
// ===================================

function connect() {
    // Es crucial que 'SockJS' y 'Stomp' estén cargados antes de llamar a esto.
    if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
        console.error("Error: SockJS o Stomp no están cargados. Asegúrate de incluir las librerías.");
        displayMessage('Error: Librerías de chat no disponibles.', 'status');
        return;
    }
    
    const socket = new SockJS('/ws'); 
    stompClient = Stomp.over(socket);
    stompClient.debug = null; // Deshabilita logs detallados de STOMP
    stompClient.connect({}, onConnected, onError);
}

function onConnected() {
    // Suscripción al topic dinámico para recibir mensajes de este chat específico.
    stompClient.subscribe('/topic/' + CHAT_ID, onMessageReceived);
    
    // Notificación de que el cliente se ha unido (para que el vendedor lo sepa)
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: CLIENT_ID, type: 'JOIN', chatId: CHAT_ID})
    );
    
    // Asignación de Event Listeners del Chat
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    if (disconnectBtn) disconnectBtn.addEventListener('click', disconnect);

    displayMessage('Conexión establecida. Comienza la conversación.', 'status');
}

function onError(error) {
    displayMessage('Error al conectar al chat. Por favor, recarga.', 'status-error'); // Clase 'status-error' recomendada
    console.error("STOMP Error:", error);
}

function sendMessage() {
    const messageContent = messageInput.value.trim();

    if (messageContent && stompClient && stompClient.connected) { // Verificar conexión
        const chatMessage = {
            sender: CLIENT_ID, 
            content: messageContent,
            type: 'CHAT',
            chatId: CHAT_ID
        };

        // Envía el mensaje al controlador de Spring Boot
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        
        messageInput.value = '';
    } else if (messageContent && !stompClient?.connected) {
        displayMessage('El chat no está conectado. Intenta reconectar.', 'status-error');
    }
}

/**
 * Lógica CORREGIDA para procesar y clasificar los mensajes recibidos del broker.
 */
function onMessageReceived(payload) {
    if (!payload || !payload.body) return;
    
    try {
        const message = JSON.parse(payload.body);
        let content = message.content;
        let messageType = '';

        if (message.type === 'CHAT') {
            if (message.sender === CLIENT_ID) {
                // Mensaje propio (que regresa del broker)
                messageType = 'cliente'; 
            } else {
                // Mensaje del vendedor/otro
                messageType = 'vendedor'; 
            }
        } else if (message.type === 'JOIN' || message.type === 'LEAVE') {
            // Mensajes de estado
            messageType = 'status';
            
            // Adaptar el texto para el usuario final (más informativo)
            if (message.sender === CLIENT_ID) {
                // Mensaje de estado propio
                content = (message.type === 'JOIN') 
                        ? 'Te has unido a la conversación.' 
                        : 'Has abandonado la conversación.';
            } else {
                // Mensaje de estado del vendedor
                content = (message.type === 'JOIN') 
                        ? 'El vendedor se ha unido a la conversación.' 
                        : 'El vendedor ha salido de la conversación.';
            }
        } else {
            messageType = 'status'; 
            content = `Estado: ${message.content || 'Acción desconocida'}`;
        }
        
        displayMessage(content, messageType, message.sender);
    } catch (e) {
        console.error("Error al parsear el mensaje recibido:", e);
        displayMessage('Error al recibir un mensaje.', 'status-error');
    }
}

/**
 * Añade el elemento HTML al chat y aplica el formato correcto.
 */
function displayMessage(content, type, sender = null) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    
    let text = content;
    if (type === 'cliente') {
        text = `Yo: ${content}`;
    } else if (type === 'vendedor') {
        text = `Vendedor: ${content}`; 
    }
    
    messageElement.textContent = text;

    chatMessages?.appendChild(messageElement);
    scrollToBottom();
}

function scrollToBottom() {
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function disconnect() {
    if (stompClient && stompClient.connected) {
        stompClient.send("/app/chat.addUser",
            {},
            JSON.stringify({sender: CLIENT_ID, type: 'LEAVE', chatId: CHAT_ID})
        );
        stompClient.disconnect(() => {
            displayMessage('Has terminado la conversación.', 'status');
            if (sendBtn) sendBtn.disabled = true;
            if (messageInput) messageInput.disabled = true;
        });
    } else {
        displayMessage('El chat ya estaba desconectado.', 'status');
    }
}


// ===================================
// INICIALIZACIÓN
// ===================================
window.addEventListener("load", () => {
    // 1. Aplicar escala de fuente base
    document.documentElement.style.setProperty('--font-scale', '1.0'); 
    
    // 2. Iniciar Animación de Carga (asume que existe una clase .loaded en el CSS)
    document.body.classList.add("loaded");
    
    // 3. Conectar al WebSocket
    if (chatMessages && messageInput) { // Solo conectar si los elementos del chat existen
        connect();
        scrollToBottom();
    }

    // 4. Actualizar nombre de página en móvil
    updateCurrentPageMobile(); 
});