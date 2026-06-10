// Define o pacote onde esta classe está guardada
package com.academia.gymnex.service;

// Importa o modelo Aluno
import com.academia.gymnex.model.Aluno;
// Importa as classes do Firestore para comunicar com o banco de dados
import com.google.cloud.firestore.*;
// Importa o cliente do Firestore já configurado pelo FirebaseConfig
import com.google.firebase.cloud.FirestoreClient;
// Marca esta classe como um serviço gerenciado pelo Spring Boot
import org.springframework.stereotype.Service;
// Importa as classes de lista do Java
import java.util.ArrayList;
import java.util.List;

// @Service: diz ao Spring que esta classe é um serviço.
// Ela fica disponível para ser injetada nos Controllers com @Autowired.
@Service
public class AlunoService {

    // Nome da coleção dentro do Firebase onde os alunos são guardados
    private static final String COLLECTION = "alunos";

    // Método que salva UM aluno no Firebase (serve para criar e para editar)
    public String salvar(Aluno aluno) throws Exception {
        // Pega a conexão com o banco de dados Firestore
        Firestore db = FirestoreClient.getFirestore();
        // Variável que vai guardar a referência ao documento no Firebase
        DocumentReference doc;

        // Se o aluno não tem ID ainda, é um cadastro novo
        if (aluno.getId() == null || aluno.getId().isEmpty()) {
            // O Firebase gera um ID aleatório e único para este novo documento
            doc = db.collection(COLLECTION).document();
            // Guarda o ID gerado dentro do objeto aluno para retornar depois
            aluno.setId(doc.getId());
        } else {
            // Se já tem ID, é uma edição — aponta para o documento existente
            doc = db.collection(COLLECTION).document(aluno.getId());
        }

        // Envia o objeto aluno completo para o Firebase e espera a confirmação (.get() aguarda)
        doc.set(aluno).get();
        // Devolve o ID do aluno que foi salvo
        return aluno.getId();
    }

    // Método que busca TODOS os alunos da coleção no Firebase
    public List<Aluno> listarTodos() throws Exception {
        // Pega a conexão com o banco
        Firestore db = FirestoreClient.getFirestore();
        // Busca todos os documentos da coleção "alunos" e aguarda o resultado
        List<QueryDocumentSnapshot> docs = db.collection(COLLECTION).get().get().getDocuments();
        // Cria uma lista vazia para guardar os alunos convertidos
        List<Aluno> lista = new ArrayList<>();
        // Percorre cada documento retornado pelo Firebase
        for (QueryDocumentSnapshot d : docs) {
            // Converte o documento JSON do Firebase para um objeto Aluno e adiciona à lista
            lista.add(d.toObject(Aluno.class));
        }
        // Devolve a lista completa de alunos
        return lista;
    }

    // Método que busca UM aluno específico pelo ID
    public Aluno buscarPorId(String id) throws Exception {
        // Pega a conexão com o banco
        Firestore db = FirestoreClient.getFirestore();
        // Busca o documento com o ID informado e aguarda o resultado
        DocumentSnapshot doc = db.collection(COLLECTION).document(id).get().get();
        // Se o documento existe, converte para Aluno e devolve. Se não existe, devolve null.
        return doc.exists() ? doc.toObject(Aluno.class) : null;
    }
}