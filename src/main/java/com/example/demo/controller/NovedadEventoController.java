package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.NovedadEvento;
import com.example.demo.repository.NovedadEventoRepository;

@RestController
@RequestMapping("/api/novedades") 
@CrossOrigin(origins = "*") 
public class NovedadEventoController {

    @Autowired
    private NovedadEventoRepository eventoRepository;

    /**
     * Ruta: GET /gandersync/api/novedades/eventos
     */
    @GetMapping("/eventos")
    public List<NovedadEvento> getAllEventos() {
        return eventoRepository.findAll();
    }

    /**
     * Ruta: POST /gandersync/api/novedades/guardar
     */
    @PostMapping("/guardar")
    public ResponseEntity<NovedadEvento> saveOrUpdateEvento(@RequestBody NovedadEvento evento) {
        try {
            NovedadEvento eventoGuardado = eventoRepository.save(evento);
            return new ResponseEntity<>(eventoGuardado, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Ruta: DELETE /gandersync/api/novedades/eliminar/{id}
     */
    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<HttpStatus> deleteEvento(@PathVariable Long id) {
        try {
            if (!eventoRepository.existsById(id)) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            eventoRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); 
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}