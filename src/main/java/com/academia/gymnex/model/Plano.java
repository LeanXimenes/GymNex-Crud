package com.academia.gymnex.model;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Plano {
    private String id;
    private String nomePlano;
    private Double preco;
    private Integer duracaoMeses;
}