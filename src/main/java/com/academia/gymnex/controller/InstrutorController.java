package com.academia.gymnex.controller;

import com.academia.gymnex.model.Instrutor;
import com.academia.gymnex.repository.InstrutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/instrutores")
public class InstrutorController {

    @Autowired
    private InstrutorRepository instrutorRepository;

    @GetMapping("/{id}")
    public ResponseEntity<Instrutor> buscarPorId(@PathVariable Long id) {
        return instrutorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Instrutor> atualizarInstrutor(@PathVariable Long id, @RequestBody Instrutor dados) {
        return instrutorRepository.findById(id)
                .map(instrutor -> {
                    instrutor.setNome(dados.getNome());
                    instrutor.setEmail(dados.getEmail());
                    instrutor.setTelefone(dados.getTelefone());
                    instrutor.setEspecialidades(dados.getEspecialidades());
                    instrutor.setFotoPerfilUrl(dados.getFotoPerfilUrl());
                    instrutor.setNotificacoesEmail(dados.getNotificacoesEmail());
                    instrutor.setNotificacoesSms(dados.getNotificacoesSms());
                    instrutor.setTemaEscuro(dados.getTemaEscuro());
                    return ResponseEntity.ok(instrutorRepository.save(instrutor));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}