package com.academia.gymnex.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_sinais_vitais")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SinalVital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    private Integer batimentosCardiacos;

    private String pressaoArterial;

    private Integer saturacaoOxigenio;

    private LocalDateTime dataHoraRegistro;

    private String observacoes;

    @PrePersist
    public void prePersist() {
        if (this.dataHoraRegistro == null) {
            this.dataHoraRegistro = LocalDateTime.now();
        }
    }
}