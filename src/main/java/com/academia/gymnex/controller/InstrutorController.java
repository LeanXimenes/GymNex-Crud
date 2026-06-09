package com.academia.gymnex.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/instrutores")
public class InstrutorController {

    @GetMapping("/{id}")
    public ResponseEntity<String> buscarMock(@PathVariable String id) {
        return ResponseEntity.ok("{\"nome\":\"Instrutor Admin\", \"fotoPerfilUrl\":\"\"}");
    }
}