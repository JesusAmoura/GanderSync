package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // <-- IMPORT NECESARIO
import org.springframework.security.crypto.password.PasswordEncoder; // <-- IMPORT NECESARIO
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuración de Spring Security para el proyecto.
 * Incluye la definición del PasswordEncoder para el servicio de contraseñas.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

 
    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCryptPasswordEncoder es el estándar para hashear contraseñas.
        return new BCryptPasswordEncoder();
    }
    
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Deshabilita CSRF
            .csrf(AbstractHttpConfigurer::disable)
            
            // 2. Define las reglas de autorización para las peticiones HTTP
            .authorizeHttpRequests(authorize -> authorize
                // PERMITE acceso sin autenticación a todas las rutas.
                // Esto incluye las nuevas rutas de recuperación: 
                // /api/password/send-code, /api/password/verify-code, /api/password/reset
                .requestMatchers("/ws/**", "/topic/**", "/app/**", "/**").permitAll() 
                
                .anyRequest().permitAll()
            )
            
            // 3. Permite que el contenido se incruste en frames (para H2, por ejemplo)
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.disable())
            );

        return http.build();
    }
}