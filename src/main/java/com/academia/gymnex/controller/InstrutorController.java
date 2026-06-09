package com.academia.gymnex.controller;

import com.academia.gymnex.model.Instrutor;
import com.academia.gymnex.service.InstrutorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/instrutores")
public class InstrutorController {

    @Autowired
    private InstrutorService instrutorService;

    // POST: Criar novo instrutor
    @PostMapping
    public ResponseEntity<Instrutor> criarInstrutor(@RequestBody Instrutor instrutor) throws Exception {
        instrutorService.salvar(instrutor);
        return ResponseEntity.ok(instrutor);
    }

    // PUT: Atualizar dados (O que a tela de Perfil usa)
    @PutMapping("/{id}")
    public ResponseEntity<Instrutor> atualizarInstrutor(@PathVariable String id, @RequestBody Instrutor instrutor) throws Exception {
        instrutor.setId(id);
        instrutorService.salvar(instrutor);
        return ResponseEntity.ok(instrutor);
    }

    // GET: Buscar os dados para mostrar no menu lateral e no Perfil
    @GetMapping("/{id}")
    public ResponseEntity<Instrutor> buscarInstrutor(@PathVariable String id) throws Exception {
        Instrutor instrutor = instrutorService.buscarPorId(id);

        // Se encontrar no Firebase, devolve os dados reais
        if (instrutor != null) {
            return ResponseEntity.ok(instrutor);
        }

        // TRUQUE DE MESTRE: O seu Javascript procura sempre o instrutor com ID "1".
        // Se ele ainda não existir no Firebase, devolvemos este padrão para o sistema não quebrar.
        // Assim que você editar e salvar no Frontend, ele criará o documento "1" automaticamente na nuvem!
        Instrutor padrao = new Instrutor();
        padrao.setId(id);
        padrao.setNome("Instrutor Admin");
        padrao.setEmail("admin@gymnex.com");
        return ResponseEntity.ok(padrao);
    }
}