// Define o pacote onde esta classe está guardada
package com.academia.gymnex;

// Importa a classe que sabe como ligar o servidor Spring Boot
import org.springframework.boot.SpringApplication;
// Importa a anotação que ativa todas as configurações automáticas do Spring Boot
import org.springframework.boot.autoconfigure.SpringBootApplication;

// @SpringBootApplication: diz ao Java que este é o ponto de partida da aplicação.
// Ela ativa 3 coisas ao mesmo tempo: leitura de configurações, scan de classes e auto-configuração.
@SpringBootApplication
public class GymnexApplication {

	// Método main: é o primeiro método que o Java executa quando o programa é iniciado
	public static void main(String[] args) {
		// Liga o servidor Spring Boot passando esta própria classe como referência
		// A partir daqui o servidor sobe na porta definida no application.properties
		SpringApplication.run(GymnexApplication.class, args);
	}

}