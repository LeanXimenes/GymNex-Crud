package com.academia.gymnex.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tb_planos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Plano {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String nomePlano; // Ex: "Plano Mensal", "Plano Anual VIP"

    @Column(nullable = false)
    private BigDecimal preco;

    private Integer duracaoMeses;
}