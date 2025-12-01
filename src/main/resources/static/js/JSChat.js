// ===================================
// VARIABLES GENERALES Y ACCESIBILIDAD
// ===================================
const body = document.getElementById("body");
const navbar = document.querySelector(".barra-navegacion");
const footer = document.querySelector(".footer");

// Elementos de Accesibilidad 
const floatingAccessibilityBtn = document.getElementById("floatingAccessibilityBtn");
const accessibilitySidebar = document.getElementById("accessibility-sidebar");
const closeAccessibility = document.getElementById("closeAccessibility");
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


// ===================================
// VARIABLES ESPECÍFICAS DEL CHAT
// ===================================
let stompClient = null;
const chatMessages = document.getElementById("chat-messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const disconnectBtn = document.getElementById("disconnectBtn");

// ⭐ ESTOS IDs DEBEN SER CONFIGURADOS DINÁMICAMENTE EN UN ENTORNO REAL (e.g., Spring/Thymeleaf)
// Usamos valores placeholder para la funcionalidad.
const CHAT_ID = "chat-cliente-vendedor-123"; 
const CLIENT_ID = "Cliente_456"; 

// ===================================
// FUNCIONES DE UTILIDAD Y ACCESIBILIDAD
// ===================================

function toggleAccessibilitySidebar() {
    const isOpen = accessibilitySidebar?.classList.toggle("open");
    if (accessibilitySidebar) {
        // La barra se oculta/muestra usando 'hidden' y la clase 'open' para la animación
        accessibilitySidebar.toggleAttribute('hidden', !isOpen);
        floatingAccessibilityBtn.setAttribute('aria-expanded', isOpen);
    }
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
        body?.classList.remove("high-contrast");
        toggleContrastBtn.textContent = "Alto Contraste: DESACTIVADO";
    }

    root.style.setProperty('--font-scale', currentScale.toFixed(2));
}

// Event Listeners de Accesibilidad
floatingAccessibilityBtn?.addEventListener("click", toggleAccessibilitySidebar);
closeAccessibility?.addEventListener("click", toggleAccessibilitySidebar);
toggleContrastBtn?.addEventListener("click", toggleContrast);
increaseTextBtn?.addEventListener("click", () => changeFontSize('increase'));
decreaseTextBtn?.addEventListener("click", () => changeFontSize('decrease'));
resetTextBtn?.addEventListener("click", () => changeFontSize('reset'));


// ===================================
// ANIMACIÓN DE NAVBAR Y FOOTER
// ===================================
const scrollThreshold = 80;

window.addEventListener("scroll", () => {
    const actualScroll = window.scrollY || document.documentElement.scrollTop;

    // Si hay un modal o sidebar abierto, no modificar el navbar/footer
    if (
      (accessibilitySidebar && accessibilitySidebar.classList.contains("open"))
    )
      return;

    // --- NAVBAR (Se mantiene la lógica para ocultar al bajar y mostrar al subir) ---
    if (actualScroll > ultimoScroll && actualScroll > scrollThreshold) {
        // Ocultar al bajar
        navbar?.classList.add('oculta');
    } else if (actualScroll < ultimoScroll) {
        // Mostrar al subir
        navbar?.classList.remove('oculta');
    }
    
    if (actualScroll <= 0) {
        navbar?.classList.remove("oculta");
    }

    ultimoScroll = Math.max(actualScroll, 0);

    // --- FOOTER (Lógica para mostrar/ocultar el footer fijo SIN saltos) ---
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const scrollPosition = actualScroll + windowHeight;
    // Muestra el footer fijo si la posición actual está a 200px del final del contenido real
    const footerShowThreshold = documentHeight - 200; 

    if (scrollPosition >= footerShowThreshold) {
        footer?.classList.add("visible");
    } else {
        footer?.classList.remove("visible");
    }

}, { passive: true });


// ===================================
// LÓGICA DE WEBSOCKETS (CHAT) - Corregido el envío/recepción
// ===================================

function connect() {
    // ⭐ CONEXIÓN USANDO EL ENDPOINT '/ws' DE TU WebSocketConfig
    const socket = new SockJS('/ws'); 
    stompClient = Stomp.over(socket);
    stompClient.debug = null; // Deshabilita el logging de STOMP en consola
    stompClient.connect({}, onConnected, onError);
}

function onConnected() {
    // Suscribirse al canal específico de este chat
    stompClient.subscribe('/topic/' + CHAT_ID, onMessageReceived);
    
    // Aviso de JOIN (usando el modelo ChatMessage actualizado con chatId)
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: CLIENT_ID, type: 'JOIN', chatId: CHAT_ID})
    );
    
    // ⭐ Activamos listeners de envío, asegurando que el chat funcione
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
    displayMessage('Error al conectar al chat. Por favor, recarga.', 'status');
    console.error("STOMP Error:", error);
}

function sendMessage() {
    const messageContent = messageInput.value.trim();

    // Aseguramos que el mensaje incluya el chatId
    if (messageContent && stompClient) {
        const chatMessage = {
            sender: CLIENT_ID, 
            content: messageContent,
            type: 'CHAT',
            chatId: CHAT_ID // CRUCIAL para el controlador
        };

        // Enviar mensaje al servidor al destino /app/chat.sendMessage
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        
        messageInput.value = '';
    }
}

function onMessageReceived(payload) {
    // Verificamos si payload y payload.body existen antes de parsear
    if (!payload || !payload.body) return;
    
    try {
        const message = JSON.parse(payload.body);
        let messageType = '';

        // Determinar si el mensaje es mío o del vendedor
        if (message.sender === CLIENT_ID) {
            messageType = 'cliente'; 
        } else if (message.type === 'CHAT') {
            messageType = 'vendedor'; 
        } else {
            messageType = 'status'; 
        }
        
        // CORRECCIÓN LÓGICA: Para mensajes de estado (JOIN/LEAVE), usar el contenido directamente
        const content = (message.type === 'JOIN' || message.type === 'LEAVE') 
                        ? (message.sender === CLIENT_ID ? 'Te has unido a la conversación.' : `El vendedor se ha unido.`) // Podrías personalizar esto
                        : message.content;
                        
        displayMessage(content, messageType, message.sender);
    } catch (e) {
        console.error("Error al parsear el mensaje recibido:", e);
    }
}

function displayMessage(content, type, sender = null) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    
    let text = content;
    if (type === 'cliente') {
        text = `Yo: ${content}`;
    } else if (type === 'vendedor') {
        // En un entorno real, el vendedor tendría un ID diferente, aquí lo asumimos.
        text = `Vendedor: ${content}`; 
    }
    
    messageElement.textContent = text;

    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function disconnect() {
    if (stompClient) {
        // Enviar notificación de salida
        stompClient.send("/app/chat.addUser",
            {},
            JSON.stringify({sender: CLIENT_ID, type: 'LEAVE', chatId: CHAT_ID})
        );
        stompClient.disconnect(() => {
            displayMessage('Has terminado la conversación.', 'status');
            // Desactivar UI de envío
            if (sendBtn) sendBtn.disabled = true;
            if (messageInput) messageInput.disabled = true;
        });
    }
}


// ===================================
// INICIALIZACIÓN
// ===================================
window.addEventListener("load", () => {
    // 1. Aplicar escala de fuente base
    document.documentElement.style.setProperty('--font-scale', '1.0'); 

    // 2. Iniciar Animación de Carga
    document.body.classList.add("loaded");
    
    // 3. Conectar al WebSocket
    // ⭐ Si el error de conexión persiste, verifica la URL absoluta en el navegador
    // y asegúrate de que el backend está corriendo en la misma ruta base.
    connect();

    // Inicia el chat scroll al final
    scrollToBottom();
});