package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuración para habilitar y configurar el broker de mensajes de WebSocket.
 * * Usamos STOMP (Simple Text-Oriented Messaging Protocol) sobre WebSockets.
 */
@Configuration
@EnableWebSocketMessageBroker // Habilita el manejo de mensajes STOMP a través de WebSockets
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * 1. Registra el endpoint donde el cliente iniciará la conexión WebSocket.
     * @param registry Registro de endpoints STOMP.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Registra el endpoint "/ws" para la conexión de SockJS/WebSocket.
        // El cliente de JS debe conectar a "ws://localhost:8080/gandersync/ws"
        // El prefijo del contexto "/gandersync" se toma de application.properties.
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Permite la conexión desde cualquier origen (útil para desarrollo/CORS)
                .withSockJS(); // Habilita el fallback de SockJS si WebSockets nativos no están disponibles
    }

    /**
     * 2. Configura el broker de mensajes.
     * @param config Configuración del broker.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Prefijo para los mensajes que van del servidor al cliente (suscripciones públicas)
        // Ejemplo: /topic/public
        config.enableSimpleBroker("/topic");
        
        // Prefijo para los mensajes que van del cliente al servidor (mensajes de la aplicación)
        // Ejemplo: el cliente envía un mensaje a /app/chat.sendMessage
        config.setApplicationDestinationPrefixes("/app");
    }
}