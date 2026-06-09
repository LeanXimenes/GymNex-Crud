package com.academia.gymnex.repository;

import com.academia.gymnex.model.SinalVital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SinalVitalRepository extends JpaRepository<SinalVital, Long> {
}