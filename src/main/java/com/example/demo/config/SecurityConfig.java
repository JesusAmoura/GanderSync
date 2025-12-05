package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

/**
 * Configuración de Spring Security para el proyecto.
 * Asegura que las rutas de WebSocket estén exentas de autenticación.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Define la cadena de filtros de seguridad HTTP.
     * @param http Objeto HttpSecurity para configurar la seguridad.
     * @return El filtro de seguridad configurado.
     * @throws Exception Si ocurre un error de configuración.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Deshabilita CSRF (Cross-Site Request Forgery). 
            // Esto es crucial para la conexión de WebSockets/SockJS en muchos escenarios,
            // ya que el handshake inicial no pasa por el filtro de CSRF de sesiones estándar.
            .csrf(AbstractHttpConfigurer::disable)
            
            // 2. Define las reglas de autorización para las peticiones HTTP
            .authorizeHttpRequests(authorize -> authorize
                // PERMITE acceso sin autenticación a la ruta base del WebSocket (ej. /ws/info, /ws/websocket)
                // y a todas las demás rutas de la aplicación para una configuración simple.
                // En un entorno de producción, aquí se definirían permisos más restrictivos.
                .requestMatchers("/ws/**", "/topic/**", "/app/**", "/**").permitAll() 
                
                // Si deseas requerir autenticación para el resto de la aplicación, usa:
                // .anyRequest().authenticated()
                
                // Pero, manteniendo la lógica simple del usuario:
                .anyRequest().permitAll()
            )
            
            // 3. Permite que el contenido se incruste en frames. 
            // Útil para la consola H2 o si la aplicación corre dentro de un iFrame (como en Canvas).
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.disable())
            );

        return http.build();
    }
}