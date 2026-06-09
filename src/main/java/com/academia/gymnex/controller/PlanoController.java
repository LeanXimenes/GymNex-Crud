package com.academia.gymnex.controller;

import com.academia.gymnex.model.Plano;
import com.academia.gymnex.service.PlanoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/planos")
public class PlanoController {

    @Autowired
    private PlanoService planoService;

    // NOVO MÉTODO: Recebe a requisição para criar um Plano
    @PostMapping
    public ResponseEntity<Plano> cadastrarPlano(@RequestBody Plano plano) throws Exception {
        planoService.salvar(plano);
        return ResponseEntity.ok(plano);
    }

    @GetMapping
    public List<Plano> listarTodos() throws Exception {
        return planoService.listarTodos();
    }
}