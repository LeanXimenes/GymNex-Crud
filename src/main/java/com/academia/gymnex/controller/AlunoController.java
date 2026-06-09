package com.academia.gymnex.controller;

import com.academia.gymnex.model.Aluno;
import com.academia.gymnex.service.AlunoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/alunos")
public class AlunoController {

    @Autowired
    private AlunoService alunoService;

    @PostMapping
    public ResponseEntity<Aluno> cadastrarAluno(@RequestBody Aluno aluno) throws Exception {
        aluno.setAtivo(true);
        alunoService.salvar(aluno);
        return ResponseEntity.ok(aluno);
    }

    @GetMapping
    public ResponseEntity<List<Aluno>> listarTodos() throws Exception {
        return ResponseEntity.ok(alunoService.listarTodos());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Aluno> atualizarAluno(@PathVariable String id, @RequestBody Aluno aluno) throws Exception {
        aluno.setId(id);
        alunoService.salvar(aluno);
        return ResponseEntity.ok(aluno);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Aluno> alternarStatus(@PathVariable String id) throws Exception {
        Aluno aluno = alunoService.buscarPorId(id);
        if (aluno != null) {
            aluno.setAtivo(!aluno.getAtivo());
            alunoService.salvar(aluno);
            return ResponseEntity.ok(aluno);
        }
        return ResponseEntity.notFound().build();
    }
}