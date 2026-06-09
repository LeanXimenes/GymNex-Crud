package com.academia.gymnex.service;

import com.academia.gymnex.model.Aluno;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class AlunoService {
    private static final String COLLECTION = "alunos";

    public String salvar(Aluno aluno) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        DocumentReference doc;
        if (aluno.getId() == null || aluno.getId().isEmpty()) {
            doc = db.collection(COLLECTION).document();
            aluno.setId(doc.getId());
        } else {
            doc = db.collection(COLLECTION).document(aluno.getId());
        }
        doc.set(aluno).get();
        return aluno.getId();
    }

    public List<Aluno> listarTodos() throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        List<QueryDocumentSnapshot> docs = db.collection(COLLECTION).get().get().getDocuments();
        List<Aluno> lista = new ArrayList<>();
        for (QueryDocumentSnapshot d : docs) {
            lista.add(d.toObject(Aluno.class));
        }
        return lista;
    }

    public Aluno buscarPorId(String id) throws Exception {
        Firestore db = FirestoreClient.getFirestore();
        DocumentSnapshot doc = db.collection(COLLECTION).document(id).get().get();
        return doc.exists() ? doc.toObject(Aluno.class) : null;
    }
}