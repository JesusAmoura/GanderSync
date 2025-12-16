// src/main/java/com/example/demo/services/UserService.java
package com.example.demo.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder; // <<-- IMPORTANTE
import org.springframework.stereotype.Service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    // ⚠️ CRÍTICO: Inyección del PasswordEncoder para hasheo
    @Autowired 
    private PasswordEncoder passwordEncoder; 

    // ------------------- Registro (MODIFICADO para BCrypt) -------------------
    public User registrar(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }

        // ⚠️ CRÍTICO: Hashear la contraseña ANTES de guardar
        String rawPassword = user.getPassword();
        user.setPassword(passwordEncoder.encode(rawPassword)); 

        // Lógica de normalización de rol (de ROLE_VENDEDOR a Vendedor)
        String selectedRole = user.getRole();
        if (selectedRole != null && selectedRole.toUpperCase().startsWith("ROLE_")) {
            String baseRole = selectedRole.substring(5).toLowerCase(); 
            if (!baseRole.isEmpty()) {
                String titleCaseRole = baseRole.substring(0, 1).toUpperCase() + baseRole.substring(1);
                user.setRole(titleCaseRole); 
            }
        }
        
        return userRepository.save(user);
    }

    // ------------------- Login (CORREGIDO Y SEGURO) -------------------
    public User login(String email, String password, String selectedRole) {
        Optional<User> usuarioOpt = userRepository.findByEmail(email);

        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("Usuario no registrado"); 
        }

        User user = usuarioOpt.get();

        // ⚠️ CRÍTICO: Usar PasswordEncoder.matches para comparar de forma segura el texto plano con el hash
        if (passwordEncoder.matches(password, user.getPassword())) {
            
            // Si el password es correcto, devuelve el usuario (la comparación de rol la hace el JS)
            return user;
        } else {
            throw new RuntimeException("Contraseña inválida");
        }
    }
}