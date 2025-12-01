package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PagesController {

    @GetMapping("/inicio")
    public String mostrarInicio() {
        return "InterfazInicio"; // carga InterfazInicio.html
    }

    @GetMapping("/historia")
    public String mostrarHistoria() {
        return "InterfazHistoria"; // carga InterfazHistoria.html
    }

    @GetMapping("/novedades")
    public String mostrarNovedades() {
        return "InterfazNovedades"; // carga InterfazNovedades.html
    }

    @GetMapping("/ofertas")
    public String mostrarOfertas() {
        return "InterfazOfertas"; // carga InterfazOfertas.html
    }

    @GetMapping("/chat")
    public String mostrarchat() {
        return "InterfazChat"; // carga InterfazChat.html
    }
}
