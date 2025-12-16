package com.example.demo.services;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Asume que usa Spring Security para el cifrado

import com.example.demo.model.PasswordResetToken;
import com.example.demo.model.User;
import com.example.demo.repository.TokenRepository;
import com.example.demo.repository.UserRepository;

import jakarta.mail.MessagingException;

@Service
public class PasswordService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final Random random = new Random();

    /**
     * 1. Genera un código, guarda el token en DB y envía el correo.
     */
    @Transactional
    public boolean sendRecoveryCode(String email) throws MessagingException {
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isEmpty()) {
            return false; // No revela si el email existe
        }
        
        User user = userOptional.get();

        // Elimina tokens anteriores para asegurar solo uno sea válido
        tokenRepository.deleteByUser(user);

        // Generar código de 6 dígitos
        String code = String.format("%06d", random.nextInt(999999));
        
        // Crear token (expira en 10 minutos)
        PasswordResetToken token = new PasswordResetToken(
                code,
                user,
                LocalDateTime.now().plusMinutes(10)
        );
        tokenRepository.save(token);

        // Enviar correo
        sendEmail(user.getEmail(), code);
        return true;
    }

    private void sendEmail(String recipientEmail, String code) throws MessagingException {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("soportegandersync@gmail.com"); 
        message.setTo(recipientEmail);
        message.setSubject("Recuperación de Contraseña - Código de Verificación");
        message.setText("Su código de verificación es: " + code + 
                        "\nEste código expirará en 10 minutos.");

        try {
            mailSender.send(message);
            System.out.println("Correo de recuperación enviado exitosamente a: " + recipientEmail);
        } catch (Exception e) {
            System.err.println("Error al enviar correo: " + e.getMessage());
            // Lanza la excepción para que el controlador pueda devolver el error 500 si falla el SMTP
            throw new MessagingException("Fallo en la autenticación o conexión SMTP: " + e.getMessage(), e);
        }
    }

    /**
     * 2. Valida el código de verificación y la expiración.
     */
    public Optional<User> validateCode(String email, String code) {
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return Optional.empty();
        }
        User user = userOptional.get();

        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(code);

        if (tokenOpt.isPresent()) {
            PasswordResetToken token = tokenOpt.get();
            
            // 1. Token pertenece al usuario y 2. No ha expirado
            if (token.getUser().getId().equals(user.getId()) && token.getExpiryDate().isAfter(LocalDateTime.now())) {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }

    /**
     * 3. Restablece la contraseña del usuario.
     */
    @Transactional
    public boolean resetPassword(String email, String newPassword) {
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return false;
        }
        User user = userOptional.get();

        // Codificar y guardar la nueva contraseña
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Eliminar el token para que no se pueda usar dos veces
        tokenRepository.deleteByUser(user);
        
        return true;
    }
}