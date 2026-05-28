package com.academia.gymnex.repository;

import com.academia.gymnex.model.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, Long> {
    // Essa interface herda todos os métodos de CRUD (save, delete, find) automaticamente.
}