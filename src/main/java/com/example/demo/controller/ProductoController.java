package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.demo.model.Producto;
import com.example.demo.services.ProductoService;

@Controller
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    // Carga inicial (vista principal)
    @GetMapping("/productos")
    public String vistaProductos(Model model) {
        List<Producto> productos = productoService.listar();
        model.addAttribute("productos", productos);
        return "InterfazProductos";
    }

    // 🟢 Endpoint REST para listar productos (usado por JS)
    @GetMapping("/api/productos")
    @ResponseBody
    public List<Producto> listarProductos() {
        return productoService.listar();
    }

    // 🟢 Guardar (crear o editar)
    @PostMapping("/api/productos")
    @ResponseBody
    public Producto guardarProducto(@RequestBody Producto producto) {
        return productoService.guardar(producto);
    }

    // 🟢 Eliminar
    @DeleteMapping("/api/productos/{id}")
    @ResponseBody
    public void eliminarProducto(@PathVariable Long id) {
        productoService.eliminar(id);
    }
}
