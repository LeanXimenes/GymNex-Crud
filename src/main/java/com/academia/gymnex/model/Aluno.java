package com.academia.gymnex.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "tb_alunos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Aluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(length = 20)
    private String telefone;

    // Novos Campos
    private LocalDate dataNascimento;
    private String cidade;

    @Column(columnDefinition = "TEXT")
    private String condicaoMedica;

    private Boolean possuiSmartwatch = false;
    private String dispositivoMac;

    // Status para o Soft Delete (Inativar)
    private Boolean ativo = true;

    // Relacionamento: Muitos alunos podem ter o mesmo Plano
    @ManyToOne
    @JoinColumn(name = "plano_id")
    private Plano plano;
}