package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    // Página de chat
    @GetMapping("/chat")
    public String mostrarChat() {
        return "chat"; // carga chat.html
    }
}
