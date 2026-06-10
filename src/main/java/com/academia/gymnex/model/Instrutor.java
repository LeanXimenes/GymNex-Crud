// Define o pacote onde esta classe está guardada
package com.academia.gymnex.model;

// Importa todas as anotações do Lombok
import lombok.*;

// @Getter / @Setter: geram getters e setters para todos os campos automaticamente
// @NoArgsConstructor: cria o construtor vazio, necessário para o Jackson ler JSON
// @AllArgsConstructor: cria o construtor com todos os campos preenchidos
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Instrutor {

    // Identificador único do instrutor no Firebase
    private String id;

    // Nome completo do instrutor
    private String nome;

    // E-mail do instrutor
    private String email;

    // Número de telefone do instrutor
    private String telefone;

    // Especialidades do instrutor (ex: "Musculação, Crossfit")
    private String especialidades;

    // URL da foto de perfil armazenada em Base64 ou link externo
    private String fotoPerfilUrl;

    // Define se o instrutor quer receber notificações por e-mail (true = sim)
    private Boolean notificacoesEmail;

    // Define se o instrutor quer receber notificações por SMS (true = sim)
    private Boolean notificacoesSms;

    // Define se o instrutor prefere o tema escuro na interface (true = escuro)
    private Boolean temaEscuro;
}