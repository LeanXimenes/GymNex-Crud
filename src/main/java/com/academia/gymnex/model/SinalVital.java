// Define o pacote onde esta classe está guardada
package com.academia.gymnex.model;

// Importa todas as anotações do Lombok
import lombok.*;

// @Getter / @Setter: geram getters e setters para todos os campos automaticamente
// @NoArgsConstructor: cria o construtor vazio
// @AllArgsConstructor: cria o construtor com todos os campos
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SinalVital {

    // Identificador único do registro de sinal vital no Firebase
    private String id;

    // Referência ao aluno dono deste registro — armazena o objeto Aluno completo
    private Aluno aluno;

    // Frequência cardíaca em batimentos por minuto (BPM)
    private Integer batimentosCardiacos;

    // Pressão arterial no formato texto (ex: "120/80")
    private String pressaoArterial;
}