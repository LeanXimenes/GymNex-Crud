// Define o pacote onde esta classe está guardada
package com.academia.gymnex.service;

// Importa o modelo Plano
import com.academia.gymnex.model.Plano;
// Importa as classes do Firestore para comunicar com o banco de dados
import com.google.cloud.firestore.*;
// Importa o cliente do Firestore já configurado pelo FirebaseConfig
import com.google.firebase.cloud.FirestoreClient;
// Marca esta classe como um serviço gerenciado pelo Spring Boot
import org.springframework.stereotype.Service;
// Importa as classes de lista do Java
import java.util.ArrayList;
import java.util.List;

// @Service: diz ao Spring que esta classe é um serviço disponível para injeção nos Controllers
@Service
public class PlanoService {

    // Nome da coleção no Firebase onde os planos são guardados
    private static final String COLLECTION = "planos";

    // Método que salva um plano novo ou atualiza um existente no Firebase
    public String salvar(Plano plano) throws Exception {
        // Pega a conexão com o banco de dados Firestore
        Firestore db = FirestoreClient.getFirestore();
        // Variável que vai guardar a referência ao documento
        DocumentReference doc;

        // Se o plano não tem ID, é um plano novo — o Firebase gera um ID automático
        if (plano.getId() == null || plano.getId().isEmpty()) {
            doc = db.collection(COLLECTION).document(); // cria um novo documento
            plano.setId(doc.getId()); // guarda o ID gerado no objeto
        } else {
            // Se já tem ID, aponta para o documento existente para atualizar
            doc = db.collection(COLLECTION).document(plano.getId());
        }

        // Envia o objeto plano para o Firebase e aguarda a confirmação de salvamento
        doc.set(plano).get();
        // Devolve o ID do plano salvo
        return plano.getId();
    }

    // Método que busca TODOS os planos cadastrados no Firebase
    public List<Plano> listarTodos() throws Exception {
        // Pega a conexão com o banco
        Firestore db = FirestoreClient.getFirestore();
        // Busca todos os documentos da coleção "planos" e aguarda o resultado
        List<QueryDocumentSnapshot> docs = db.collection(COLLECTION).get().get().getDocuments();
        // Cria uma lista vazia para guardar os planos convertidos
        List<Plano> lista = new ArrayList<>();
        // Percorre cada documento retornado pelo Firebase
        for (QueryDocumentSnapshot d : docs) {
            // Converte o documento JSON para um objeto Plano e adiciona à lista
            lista.add(d.toObject(Plano.class));
        }
        // Devolve a lista completa de planos
        return lista;
    }
}