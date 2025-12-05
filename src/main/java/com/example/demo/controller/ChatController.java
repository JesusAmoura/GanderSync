package com.example.demo.controller;

import com.example.demo.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.handler.annotation.DestinationVariable; // Importación para claridad, aunque no se usa en este caso

@Controller
public class ChatController {

    @MessageMapping("/chat.sendMessage")
    // Nota: El path variable {chatId} se resuelve gracias a que Spring usa la información de conexión STOMP.
    @SendTo("/topic/{chatId}") 
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        // Lógica de negocio opcional (guardar en base de datos, validar)
        
        // Retorna el mensaje, que será enviado al broker bajo /topic/{chatId}
        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/{chatId}") 
    public ChatMessage addUser(@Payload ChatMessage chatMessage) {
        // Enviar notificación de que un usuario se unió o salió
        return chatMessage;
    }
}