package com.academia.gymnex.model;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SinalVital {
    private String id;
    private Aluno aluno;
    private Integer batimentosCardiacos;
    private String pressaoArterial;
}