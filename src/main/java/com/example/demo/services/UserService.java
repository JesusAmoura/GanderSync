package com.example.demo.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // ------------------- Registro (CORREGIDO) -------------------
    public User registrar(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }

        // CRÍTICO: Normalizar el rol antes de guardar
        // El frontend envía: "ROLE_VENDEDOR" o "ROLE_CLIENTE"
        String selectedRole = user.getRole();

        if (selectedRole != null && selectedRole.toUpperCase().startsWith("ROLE_")) {
            // 1. Quitar el prefijo "ROLE_" (dejando "VENDEDOR")
            String baseRole = selectedRole.substring(5).toLowerCase(); 
            
            // 2. Convertir a Title Case (ej: "Vendedor")
            if (!baseRole.isEmpty()) {
                String titleCaseRole = baseRole.substring(0, 1).toUpperCase() + baseRole.substring(1);
                user.setRole(titleCaseRole); // Guardar en el formato de la BD
            }
        }
        // Si no empieza con ROLE_, asumimos que ya viene limpio o usamos el valor por defecto.
        
        return userRepository.save(user);
    }

    // ------------------- Login (CORREGIDO) -------------------
    /**
     * @param selectedRole El rol enviado por el usuario en el formulario (ej: ROLE_VENDEDOR)
     * @return El objeto User completo, con el rol registrado en la BD (ej: Vendedor)
     */
    public User login(String email, String password, String selectedRole) { // Firma actualizada
        Optional<User> usuarioOpt = userRepository.findByEmail(email);

        // 1. Validar si el usuario existe en la base de datos
        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("Usuario no registrado"); 
        }

        User user = usuarioOpt.get();

        // 2. Validar la contraseña
        // NOTA DE SEGURIDAD: Esto usa una comparación de texto plano, lo cual es inseguro.
        // Se recomienda usar un PasswordEncoder (como BCrypt) de Spring Security para almacenar y comparar contraseñas hash.
        if (user.getPassword() != null && user.getPassword().equals(password)) {
            
            // 3. CRÍTICO: Devolver el objeto User (que contiene el rol de la BD en Title Case)
            // La lógica de comparación de roles y el modal se delegan al frontend (JSLogin)
            // para manejar la advertencia de cambio de rol.
            return user;
        } else {
            throw new RuntimeException("Contraseña inválida");
        }
    }
}