package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.User;
import com.example.demo.services.UserService;

@RestController
@RequestMapping("/auth") // Todas las rutas serán /gandersync/auth/...
public class AuthController {

    @Autowired
    private UserService userService;

    // ------------------- Registro -------------------
    @PostMapping("/register")
    public Object register(@RequestBody User user) {
        try {
            User newUser = userService.registrar(user);
            return newUser; // Devuelve JSON con datos del usuario
        } catch (Exception e) {
            return java.util.Map.of("error", e.getMessage());
        }
    }

    // ------------------- Login -------------------
    @PostMapping("/login")
    public Object login(@RequestBody User user) {
        try {
            User loggedUser = userService.login(user.getEmail(), user.getPassword());
            return loggedUser; // Devuelve JSON con datos del usuario
        } catch (Exception e) {
            return java.util.Map.of("error", "Credenciales incorrectas");
        }
    }
}
