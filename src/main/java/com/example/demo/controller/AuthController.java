package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.User;
import com.example.demo.services.UserService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    // ------------------- Registro -------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            // El objeto 'user' ya incluye el rol que viene del frontend (ej: ROLE_VENDEDOR)
            User newUser = userService.registrar(user);
            return ResponseEntity.ok(newUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // ------------------- Login (CORREGIDO) -------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            // CRÍTICO: Se pasa el email, password, y el rol que el usuario SELECCIONÓ.
            // Esto le permite al servicio hacer una validación de rol más estricta.
            User loggedUser = userService.login(user.getEmail(), user.getPassword(), user.getRole());
            
            // Se devuelve el objeto completo del usuario (que contiene su ROL REGISTRADO)
            // para que el frontend pueda hacer la comparación y disparar el modal.
            return ResponseEntity.ok(loggedUser);
        } catch (Exception e) {
            // Se usa 401 Unauthorized y se incluye el mensaje de error
            return ResponseEntity.status(401).body(java.util.Map.of("error", e.getMessage()));
        }
    }
}