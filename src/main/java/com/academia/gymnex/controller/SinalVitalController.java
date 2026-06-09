package com.academia.gymnex.controller;

import com.academia.gymnex.model.SinalVital;
import com.academia.gymnex.repository.SinalVitalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sinais-vitais")
public class SinalVitalController {

    @Autowired
    private SinalVitalRepository sinalVitalRepository;

    @PostMapping
    public ResponseEntity<SinalVital> registrarSinalVital(@RequestBody SinalVital sinalVital) {
        SinalVital salvo = sinalVitalRepository.save(sinalVital);
        return new ResponseEntity<>(salvo, HttpStatus.CREATED);
    }

    @GetMapping
    public List<SinalVital> listarTodos() {
        return sinalVitalRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SinalVital> buscarPorId(@PathVariable Long id) {
        return sinalVitalRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SinalVital> atualizarRegistro(@PathVariable Long id, @RequestBody SinalVital detalhes) {
        return sinalVitalRepository.findById(id)
                .map(registro -> {
                    registro.setBatimentosCardiacos(detalhes.getBatimentosCardiacos());
                    registro.setPressaoArterial(detalhes.getPressaoArterial());
                    registro.setSaturacaoOxigenio(detalhes.getSaturacaoOxigenio());
                    registro.setObservacoes(detalhes.getObservacoes());
                    registro.setAluno(detalhes.getAluno());
                    return ResponseEntity.ok(sinalVitalRepository.save(registro));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarRegistro(@PathVariable Long id) {
        if (!sinalVitalRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        sinalVitalRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}