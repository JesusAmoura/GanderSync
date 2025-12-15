package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios") // La tabla de usuarios
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    // 🔑 CAMPO AGREGADO PARA EL ROL
    // Asegura que este campo no tenga un valor por defecto en la BD, 
    // o que el ddl-auto de Hibernate lo cree sin DEFAULT.
    @Column(nullable = false)
    private String role; 

    public User() {
    }

    // 🔨 Constructor completo
    public User(String nombre, String email, String password, String role) {
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.role = role; // Inicializando el rol
    }

    // Constructor previo (actualizado solo para compatibilidad)
    public User(String nombre, String email, String password) {
        this.nombre = nombre;
        this.email = email;
        this.password = password;
    }

    // ------------------- Getters y Setters -------------------
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    // 🔑 Getters y Setters para el ROL (AGREGADOS)
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}