package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginPageController {

    // Página de login
    @GetMapping({"/", "/login"})
    public String mostrarLogin() {
        return "InterfazLogin"; // carga InterfazLogin.html
    }
}
