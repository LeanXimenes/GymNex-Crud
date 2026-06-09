package com.academia.gymnex.model;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Aluno {
    private String id;
    private String nome;
    private String email;
    private String telefone;
    private String dataNascimento;
    private String cidade;
    private String condicaoMedica;
    private Boolean possuiSmartwatch = false;
    private String dispositivoMac;
    private Boolean ativo = true;
    private Plano plano;
}