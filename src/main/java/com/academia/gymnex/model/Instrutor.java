package com.academia.gymnex.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_instrutores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Instrutor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false)
    private String email;

    @Column(length = 20)
    private String telefone;

    @Column(columnDefinition = "TEXT")
    private String especialidades;

    // Ajuste crítico: @Lob e TEXT garantem que Strings gigantes (como imagens Base64) sejam salvas sem quebrar o banco.
    @Lob
    @Column(columnDefinition = "TEXT")
    private String fotoPerfilUrl;

    private Boolean notificacoesEmail;

    private Boolean notificacoesSms;

    private Boolean temaEscuro;
}