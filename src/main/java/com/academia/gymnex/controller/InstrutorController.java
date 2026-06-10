// Define o pacote onde esta classe está guardada
package com.academia.gymnex.controller;

// Importa o modelo Instrutor
import com.academia.gymnex.model.Instrutor;
// Importa o serviço que comunica com o Firebase
import com.academia.gymnex.service.InstrutorService;
// Permite que o Spring injete o serviço automaticamente
import org.springframework.beans.factory.annotation.Autowired;
// Permite montar respostas HTTP com código de status
import org.springframework.http.ResponseEntity;
// Importa as anotações de rota REST
import org.springframework.web.bind.annotation.*;

// @RestController: esta classe responde a chamadas HTTP e devolve JSON
// @RequestMapping("/instrutores"): todas as rotas aqui começam com /instrutores
@RestController
@RequestMapping("/instrutores")
public class InstrutorController {

    // O Spring injeta automaticamente o InstrutorService aqui
    @Autowired
    private InstrutorService instrutorService;

    // POST /instrutores — cria um novo instrutor no Firebase
    @PostMapping
    public ResponseEntity<Instrutor> criarInstrutor(@RequestBody Instrutor instrutor) throws Exception {
        // Salva o instrutor no Firebase via serviço
        instrutorService.salvar(instrutor);
        // Devolve o instrutor criado com status 200
        return ResponseEntity.ok(instrutor);
    }

    // PUT /instrutores/{id} — atualiza os dados do instrutor (usado na tela de Perfil)
    @PutMapping("/{id}")
    public ResponseEntity<Instrutor> atualizarInstrutor(@PathVariable String id, @RequestBody Instrutor instrutor) throws Exception {
        // Garante que o ID do objeto é o mesmo que está na URL
        instrutor.setId(id);
        // Salva as alterações no Firebase
        instrutorService.salvar(instrutor);
        // Devolve o instrutor atualizado com status 200
        return ResponseEntity.ok(instrutor);
    }

    // GET /instrutores/{id} — busca os dados de um instrutor para mostrar no perfil e sidebar
    @GetMapping("/{id}")
    public ResponseEntity<Instrutor> buscarInstrutor(@PathVariable String id) throws Exception {
        // Tenta buscar o instrutor no Firebase pelo ID
        Instrutor instrutor = instrutorService.buscarPorId(id);

        // Se o instrutor foi encontrado, devolve os dados reais
        if (instrutor != null) {
            return ResponseEntity.ok(instrutor);
        }

        // Se ainda não existe no Firebase (primeira vez que o sistema roda),
        // devolve um instrutor padrão para não quebrar a interface.
        // Quando o usuário editar e salvar no frontend, o documento é criado automaticamente.
        Instrutor padrao = new Instrutor();
        padrao.setId(id);               // usa o mesmo ID que foi pedido
        padrao.setNome("Instrutor Admin");
        padrao.setEmail("admin@gymnex.com");
        return ResponseEntity.ok(padrao);
    }
}