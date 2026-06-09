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