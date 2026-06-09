package com.academia.gymnex.controller;

import com.academia.gymnex.model.Aluno;
import com.academia.gymnex.repository.AlunoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/alunos")
public class AlunoController {

    @Autowired
    private AlunoRepository alunoRepository;

    @PostMapping
    public ResponseEntity<Aluno> cadastrarAluno(@RequestBody Aluno aluno) {
        aluno.setAtivo(true); // Garante que o aluno nasce ativo
        Aluno novoAluno = alunoRepository.save(aluno);
        return new ResponseEntity<>(novoAluno, HttpStatus.CREATED);
    }

    @GetMapping
    public List<Aluno> listarTodos() {
        return alunoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Aluno> buscarPorId(@PathVariable Long id) {
        return alunoRepository.findById(id)
                .map(aluno -> ResponseEntity.ok().body(aluno))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Aluno> atualizarAluno(@PathVariable Long id, @RequestBody Aluno detalhesAluno) {
        return alunoRepository.findById(id)
                .map(aluno -> {
                    aluno.setNome(detalhesAluno.getNome());
                    aluno.setEmail(detalhesAluno.getEmail());
                    aluno.setTelefone(detalhesAluno.getTelefone());
                    aluno.setDataNascimento(detalhesAluno.getDataNascimento());
                    aluno.setCidade(detalhesAluno.getCidade());
                    aluno.setCondicaoMedica(detalhesAluno.getCondicaoMedica());
                    aluno.setPossuiSmartwatch(detalhesAluno.getPossuiSmartwatch());
                    aluno.setDispositivoMac(detalhesAluno.getDispositivoMac());
                    aluno.setPlano(detalhesAluno.getPlano());
                    // Salva as alterações
                    return ResponseEntity.ok().body(alunoRepository.save(aluno));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // NOVO MÉTODO: Alternar Status (Soft Delete) em vez de Deletar
    @PatchMapping("/{id}/status")
    public ResponseEntity<Aluno> alternarStatus(@PathVariable Long id) {
        return alunoRepository.findById(id)
                .map(aluno -> {
                    aluno.setAtivo(!aluno.getAtivo()); // Inverte o status atual
                    return ResponseEntity.ok().body(alunoRepository.save(aluno));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}