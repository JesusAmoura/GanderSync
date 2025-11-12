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

    // ------------------- Login -------------------
    public User login(String email, String password) {
        Optional<User> usuarioOpt = userRepository.findByEmail(email);
        if (usuarioOpt.isPresent() && usuarioOpt.get().getPassword().equals(password)) {
            return usuarioOpt.get();
        } else {
            throw new RuntimeException("Credenciales inválidas");
        }
    }

    // ------------------- Registro -------------------
    public User registrar(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }
        return userRepository.save(user);
    }
}
