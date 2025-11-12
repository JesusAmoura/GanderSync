let socket;

function connect() {
    // Ajusta la URL según tu servidor y puerto
    socket = new WebSocket("ws://localhost:8080/chat");

    socket.onopen = function() {
        console.log("Conectado al servidor WebSocket");
    };

    socket.onmessage = function(event) {
        const chatMessages = document.getElementById("chat-messages");
        const message = document.createElement("div");
        message.className = "message";
        message.textContent = event.data;
        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    socket.onclose = function() {
        console.log("Desconectado del servidor WebSocket");
    };
}

function sendMessage() {
    const input = document.getElementById("messageInput");
    const message = input.value.trim();
    if (message !== "") {
        socket.send(message);
        input.value = "";
    }
}

// Conectarse automáticamente al cargar la página
window.onload = connect;
