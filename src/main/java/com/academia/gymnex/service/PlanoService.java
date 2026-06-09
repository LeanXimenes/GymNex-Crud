package com.academia.gymnex.service;

import com.academia.gymnex.model.Plano;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class PlanoService {
    private static final String COLLECTION = "planos";

    // 1. NOVO MÉTODO PARA CRIAR/SALVAR UM PLANO
    public String salvar(Plano plano) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference doc;

        // Se o plano não tiver ID, é um plano novo (o Firebase gera um código aleatório)
        if (plano.getId() == null || plano.getId().isEmpty()) {
            doc = db.collection(COLLECTION).document();
            plano.setId(doc.getId());
        } else {
            // Se já tiver ID, ele atualiza o plano existente
            doc = db.collection(COLLECTION).document(plano.getId());
        }

        // Envia para a nuvem
        doc.set(plano).get();
        return plano.getId();
    }

    // 2. MÉTODO QUE VOCÊ JÁ TINHA (Listar)
    public List<Plano> listarTodos() throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        List<QueryDocumentSnapshot> docs = db.collection(COLLECTION).get().get().getDocuments();
        List<Plano> lista = new ArrayList<>();
        for (QueryDocumentSnapshot d : docs) {
            lista.add(d.toObject(Plano.class));
        }
        return lista;
    }
}