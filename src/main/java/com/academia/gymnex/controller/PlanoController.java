// Define o pacote onde esta classe está guardada
package com.academia.gymnex.controller;

// Importa o modelo Plano
import com.academia.gymnex.model.Plano;
// Importa o serviço que comunica com o Firebase
import com.academia.gymnex.service.PlanoService;
// Permite que o Spring injete o serviço automaticamente
import org.springframework.beans.factory.annotation.Autowired;
// Permite montar respostas HTTP com código de status
import org.springframework.http.ResponseEntity;
// Importa as anotações de rota REST
import org.springframework.web.bind.annotation.*;
// Importa a classe Lista do Java
import java.util.List;

// @RestController: esta classe responde a chamadas HTTP e devolve JSON
// @RequestMapping("/planos"): todas as rotas aqui começam com /planos
@RestController
@RequestMapping("/planos")
public class PlanoController {

    // O Spring injeta automaticamente o PlanoService aqui
    @Autowired
    private PlanoService planoService;

    // POST /planos — cria um novo plano de mensalidade no Firebase
    @PostMapping
    public ResponseEntity<Plano> cadastrarPlano(@RequestBody Plano plano) throws Exception {
        // Salva o plano no Firebase via serviço
        planoService.salvar(plano);
        // Devolve o plano salvo com status 200
        return ResponseEntity.ok(plano);
    }

    // GET /planos — devolve a lista com todos os planos cadastrados
    @GetMapping
    public List<Plano> listarTodos() throws Exception {
        // Busca todos os planos no Firebase e devolve a lista
        return planoService.listarTodos();
    }
}