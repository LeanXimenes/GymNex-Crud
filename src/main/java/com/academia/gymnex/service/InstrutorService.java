package com.academia.gymnex.service;

import com.academia.gymnex.model.Instrutor;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

@Service
public class InstrutorService {

    private static final String COLLECTION = "instrutores";

    // Método para Salvar / Atualizar
    public String salvar(Instrutor instrutor) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference doc;

        if (instrutor.getId() == null || instrutor.getId().isEmpty()) {
            doc = db.collection(COLLECTION).document();
            instrutor.setId(doc.getId());
        } else {
            doc = db.collection(COLLECTION).document(instrutor.getId());
        }

        doc.set(instrutor).get();
        return instrutor.getId();
    }

    // Método para Buscar pelo ID
    public Instrutor buscarPorId(String id) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        DocumentSnapshot doc = db.collection(COLLECTION).document(id).get().get();
        return doc.exists() ? doc.toObject(Instrutor.class) : null;
    }
}