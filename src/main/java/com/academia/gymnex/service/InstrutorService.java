// Define o pacote onde esta classe está guardada
package com.academia.gymnex.service;

// Importa o modelo Instrutor
import com.academia.gymnex.model.Instrutor;
// Importa as classes do Firestore para comunicar com o banco de dados
import com.google.cloud.firestore.*;
// Importa o cliente do Firestore já configurado pelo FirebaseConfig
import com.google.firebase.cloud.FirestoreClient;
// Marca esta classe como um serviço gerenciado pelo Spring Boot
import org.springframework.stereotype.Service;

// @Service: diz ao Spring que esta classe é um serviço disponível para injeção
@Service
public class InstrutorService {

    // Nome da coleção no Firebase onde os instrutores são guardados
    private static final String COLLECTION = "instrutores";

    // Método que salva ou atualiza um instrutor no Firebase
    public String salvar(Instrutor instrutor) throws Exception {
        // Pega a conexão com o banco de dados Firestore
        Firestore db = FirestoreClient.getFirestore();
        // Variável que vai guardar a referência ao documento
        DocumentReference doc;

        // Se não tem ID, é um instrutor novo — o Firebase vai gerar um ID automático
        if (instrutor.getId() == null || instrutor.getId().isEmpty()) {
            doc = db.collection(COLLECTION).document(); // cria um novo documento vazio
            instrutor.setId(doc.getId()); // guarda o ID gerado no objeto
        } else {
            // Se já tem ID, aponta para o documento existente para atualizar
            doc = db.collection(COLLECTION).document(instrutor.getId());
        }

        // Salva o objeto instrutor completo no Firebase e aguarda a confirmação
        doc.set(instrutor).get();
        // Devolve o ID do instrutor salvo
        return instrutor.getId();
    }

    // Método que busca um instrutor específico pelo ID
    public Instrutor buscarPorId(String id) throws Exception {
        // Pega a conexão com o banco
        Firestore db = FirestoreClient.getFirestore();
        // Busca o documento com o ID informado e aguarda o resultado
        DocumentSnapshot doc = db.collection(COLLECTION).document(id).get().get();
        // Se existe, converte para Instrutor. Se não existe, devolve null.
        return doc.exists() ? doc.toObject(Instrutor.class) : null;
    }
}