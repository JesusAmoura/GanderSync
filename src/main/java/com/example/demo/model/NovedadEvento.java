package com.example.demo.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "novedades_eventos") // Nombre de la tabla en MySQL
public class NovedadEvento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // El 'id' que tu controlador necesita

    private String title;
    private LocalDate start;
    private LocalDate end;

    // --- Constructores ---
    public NovedadEvento() {
    }

    public NovedadEvento(String title, LocalDate start, LocalDate end) {
        this.title = title;
        this.start = start;
        this.end = end;
    }

    // --- Getters y Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDate getStart() {
        return start;
    }

    public void setStart(LocalDate start) {
        this.start = start;
    }

    public LocalDate getEnd() {
        return end;
    }

    public void setEnd(LocalDate end) {
        this.end = end;
    }
}