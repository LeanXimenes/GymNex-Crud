// Define o pacote onde esta classe está guardada
package com.academia.gymnex.model;

// Importa todas as anotações do Lombok de uma vez
import lombok.*;

// @Getter: o Lombok gera automaticamente os métodos getNome(), getEmail(), etc. para todos os campos
// @Setter: o Lombok gera automaticamente os métodos setNome(), setEmail(), etc. para todos os campos
// @NoArgsConstructor: gera um construtor vazio: new Aluno() — usado pelo Jackson ao ler JSON
// @AllArgsConstructor: gera um construtor com todos os campos como parâmetro
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Aluno {

    // Identificador único do aluno, gerado automaticamente pelo Firebase
    private String id;

    // Nome completo do aluno
    private String nome;

    // E-mail de contato do aluno
    private String email;

    // Número de telefone do aluno
    private String telefone;

    // Data de nascimento no formato "YYYY-MM-DD"
    private String dataNascimento;

    // Cidade onde o aluno mora
    private String cidade;

    // Condição médica relevante informada pelo aluno (pode ser vazio)
    private String condicaoMedica;

    // Indica se o aluno tem smartwatch para monitoramento. Começa como false (não tem)
    private Boolean possuiSmartwatch = false;

    // Endereço MAC do dispositivo Bluetooth do smartwatch (ex: "AA:BB:CC:DD:EE:FF")
    private String dispositivoMac;

    // Indica se a ficha do aluno está ativa. Começa como true (ativo por padrão)
    private Boolean ativo = true;

    // Plano contratado pelo aluno — é um objeto do tipo Plano com id, nome e preço
    private Plano plano;
}