// Define o pacote onde esta classe está guardada
package com.academia.gymnex.model;

// Importa todas as anotações do Lombok
import lombok.*;

// @Getter / @Setter: geram os métodos get e set automaticamente para cada campo
// @NoArgsConstructor: gera o construtor vazio — necessário para o Jackson desserializar o JSON
// @AllArgsConstructor: gera o construtor com todos os campos
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Plano {

    // Identificador único do plano, gerado pelo Firebase
    private String id;

    // Nome do plano (ex: "Plano Mensal", "Plano Anual")
    private String nomePlano;

    // Preço do plano em reais. Double permite casas decimais (ex: 49.90)
    private Double preco;

    // Duração do plano em meses (ex: 1, 3, 12)
    private Integer duracaoMeses;
}