package com.academia.gymnex.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Instrutor {
    private String id;
    private String nome;
    private String email;
    private String telefone;
    private String especialidades;
    private String fotoPerfilUrl;
    private Boolean notificacoesEmail;
    private Boolean notificacoesSms;
    private Boolean temaEscuro;
}