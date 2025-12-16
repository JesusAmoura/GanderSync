package com.example.demo.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.example.demo.model.ChatMessage;

@Controller
public class ChatController {

    // Inyectamos el SimpMessagingTemplate para enviar mensajes programáticamente
    private final SimpMessagingTemplate messagingTemplate;

    // Inyección de dependencia (constructor)
    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        // En lugar de usar @SendTo, construimos el destino y lo enviamos
        String destination = "/topic/" + chatMessage.getChatId();
        
        // Enviamos el mensaje al broker (a todos los suscritos al chatId)
        messagingTemplate.convertAndSend(destination, chatMessage);
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessage chatMessage) {
        // Lógica para notificaciones JOIN/LEAVE
        String destination = "/topic/" + chatMessage.getChatId();
        
        // Enviamos el mensaje de estado al broker
        messagingTemplate.convertAndSend(destination, chatMessage);
    }
}