package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.services.PasswordService;

import jakarta.mail.MessagingException;

@RestController
@RequestMapping("/api/password")
public class PasswordController {

    @Autowired
    private PasswordService passwordService;

    // Estructuras de Petición (Records, para eliminar código amarillo)
    public record EmailRequest(String email) {}
    public record VerificationRequest(String email, String code) {}
    public record ResetRequest(String email, String code, String newPassword) {}

    /**
     * Endpoint 1: Inicia el proceso de recuperación y envía el código.
     * POST /api/password/send-code
     * Cuerpo: {"email": "usuario@dominio.com"}
     */
    @PostMapping("/send-code")
    public ResponseEntity<String> sendRecoveryCode(@RequestBody EmailRequest request) {
        try {
            passwordService.sendRecoveryCode(request.email());
            
            // Respuesta genérica para evitar revelar emails registrados
            return ResponseEntity.ok("Si el email está registrado, se ha enviado un código de verificación.");

        } catch (MessagingException e) {
            // Falla de conexión o autenticación de Gmail
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno del servidor al enviar el correo. Revise la Contraseña de Aplicación de Gmail.");
        }
    }

    /**
     * Endpoint 2: Verifica que el código sea correcto y no haya expirado.
     * POST /api/password/verify-code
     * Cuerpo: {"email": "usuario@dominio.com", "code": "123456"}
     */
    @PostMapping("/verify-code")
    public ResponseEntity<String> verifyCode(@RequestBody VerificationRequest request) {
        if (passwordService.validateCode(request.email(), request.code()).isPresent()) {
            return ResponseEntity.ok("Código verificado exitosamente. Proceda a cambiar la contraseña.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Código inválido o expirado.");
        }
    }

    /**
     * Endpoint 3: Permite cambiar la contraseña si el código es válido.
     * POST /api/password/reset
     * Cuerpo: {"email": "usuario@dominio.com", "code": "123456", "newPassword": "NuevaClaveFuerte"}
     */
    @PostMapping("/reset")
    public ResponseEntity<String> resetPassword(@RequestBody ResetRequest request) {
        
        // Vuelve a verificar el token por seguridad
        if (passwordService.validateCode(request.email(), request.code()).isEmpty()) {
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Código inválido o expirado.");
        }
        
        if (passwordService.resetPassword(request.email(), request.newPassword())) {
            return ResponseEntity.ok("Contraseña restablecida exitosamente.");
        } else {
            // Este caso es muy raro si el validateCode fue exitoso
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al guardar la nueva contraseña.");
        }
    }
}