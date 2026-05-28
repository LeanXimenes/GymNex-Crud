package com.academia.gymnex.controller;

import com.academia.gymnex.model.Plano;
import com.academia.gymnex.repository.PlanoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/planos")
public class PlanoController {

    @Autowired
    private PlanoRepository planoRepository;

    // 1. CREATE - CADASTRAR PLANO
    @PostMapping
    public ResponseEntity<Plano> cadastrarPlano(@RequestBody Plano plano) {
        Plano novoPlano = planoRepository.save(plano);
        return new ResponseEntity<>(novoPlano, HttpStatus.CREATED);
    }

    // 2. READ - LISTAR TODOS OS PLANOS
    @GetMapping
    public List<Plano> listarTodos() {
        return planoRepository.findAll();
    }

    // 3. READ - BUSCAR PLANO POR ID
    @GetMapping("/{id}")
    public ResponseEntity<Plano> buscarPorId(@PathVariable Long id) {
        return planoRepository.findById(id)
                .map(plano -> ResponseEntity.ok().body(plano))
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. UPDATE - ATUALIZAR PLANO (Método Adicionado)
    @PutMapping("/{id}")
    public ResponseEntity<Plano> atualizarPlano(@PathVariable Long id, @RequestBody Plano detalhesPlano) {
        return planoRepository.findById(id)
                .map(plano -> {
                    plano.setNomePlano(detalhesPlano.getNomePlano());
                    plano.setPreco(detalhesPlano.getPreco());
                    plano.setDuracaoMeses(detalhesPlano.getDuracaoMeses());
                    Plano planoAtualizado = planoRepository.save(plano);
                    return ResponseEntity.ok().body(planoAtualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. DELETE - DELETAR PLANO
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPlano(@PathVariable Long id) {
        if (!planoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        planoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}