// Define o pacote onde esta classe está guardada
package com.academia.gymnex.controller;

// Importa o modelo Aluno para usar como tipo de dado
import com.academia.gymnex.model.Aluno;
// Importa o serviço que faz o trabalho real com o Firebase
import com.academia.gymnex.service.AlunoService;
// Permite que o Spring injete automaticamente o serviço nesta classe
import org.springframework.beans.factory.annotation.Autowired;
// Permite montar respostas HTTP com status (200, 404, etc.)
import org.springframework.http.ResponseEntity;
// Importa todas as anotações de rotas REST do Spring
import org.springframework.web.bind.annotation.*;
// Importa a classe Lista do Java
import java.util.List;

// @RestController: diz ao Spring que esta classe responde a chamadas HTTP e devolve JSON
// @RequestMapping("/alunos"): define que todas as rotas desta classe começam com /alunos
@RestController
@RequestMapping("/alunos")
public class AlunoController {

    // @Autowired: o Spring cria e injeta o AlunoService automaticamente aqui
    @Autowired
    private AlunoService alunoService;

    // @PostMapping: responde a requisições POST em /alunos — usado para cadastrar novo aluno
    // @RequestBody: lê o JSON que veio do frontend e converte para um objeto Aluno
    @PostMapping
    public ResponseEntity<Aluno> cadastrarAluno(@RequestBody Aluno aluno) throws Exception {
        // Garante que todo aluno cadastrado começa como ativo
        aluno.setAtivo(true);
        // Chama o serviço para salvar o aluno no Firebase
        alunoService.salvar(aluno);
        // Devolve o aluno salvo com status 200 (OK)
        return ResponseEntity.ok(aluno);
    }

    // @GetMapping: responde a requisições GET em /alunos — usado para listar todos os alunos
    @GetMapping
    public ResponseEntity<List<Aluno>> listarTodos() throws Exception {
        // Busca todos os alunos do Firebase e devolve a lista com status 200
        return ResponseEntity.ok(alunoService.listarTodos());
    }

    // @PutMapping("/{id}"): responde a PUT em /alunos/{id} — usado para editar um aluno
    // @PathVariable: pega o {id} da URL e coloca na variável "id"
    @PutMapping("/{id}")
    public ResponseEntity<Aluno> atualizarAluno(@PathVariable String id, @RequestBody Aluno aluno) throws Exception {
        // Define o ID do aluno com o que veio na URL
        aluno.setId(id);
        // Proteção: se o campo "ativo" não veio no JSON (chegou como null),
        // vai buscar o valor atual no banco para não perder o status do aluno
        if (aluno.getAtivo() == null) {
            Aluno existente = alunoService.buscarPorId(id); // busca o aluno atual no Firebase
            // Se o aluno existir e for true, mantém true; senão mantém false
            aluno.setAtivo(existente != null && Boolean.TRUE.equals(existente.getAtivo()));
        }
        // Salva as alterações no Firebase
        alunoService.salvar(aluno);
        // Devolve o aluno atualizado com status 200
        return ResponseEntity.ok(aluno);
    }

    // @PatchMapping("/{id}/status"): responde a PATCH em /alunos/{id}/status
    // Usado para ativar ou inativar a ficha do aluno sem precisar enviar todos os dados
    @PatchMapping("/{id}/status")
    public ResponseEntity<Aluno> alternarStatus(@PathVariable String id) throws Exception {
        // Busca o aluno atual no Firebase pelo ID
        Aluno aluno = alunoService.buscarPorId(id);
        // Se o aluno foi encontrado, alterna o status
        if (aluno != null) {
            // Boolean.TRUE.equals evita NullPointerException se "ativo" for null no banco
            // Se ativo for null ou false, statusAtual = false. Se for true, statusAtual = true.
            boolean statusAtual = Boolean.TRUE.equals(aluno.getAtivo());
            // Inverte o status: se estava ativo vira inativo, e vice-versa
            aluno.setAtivo(!statusAtual);
            // Salva o novo status no Firebase
            alunoService.salvar(aluno);
            // Devolve o aluno com o novo status e status HTTP 200
            return ResponseEntity.ok(aluno);
        }
        // Se o aluno não foi encontrado no Firebase, devolve status 404 (não encontrado)
        return ResponseEntity.notFound().build();
    }
}