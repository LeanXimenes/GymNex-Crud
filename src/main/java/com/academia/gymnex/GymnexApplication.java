package com.academia.gymnex;

import com.academia.gymnex.model.Instrutor;
import com.academia.gymnex.repository.InstrutorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class GymnexApplication {

	public static void main(String[] args) {
		SpringApplication.run(GymnexApplication.class, args);
	}

	@Bean
	public CommandLineRunner carregarDados(InstrutorRepository instrutorRepository) {
		return args -> {
			if (instrutorRepository.count() == 0) {
				Instrutor instrutor = new Instrutor();
				instrutor.setNome("Instrutor Padrão");
				instrutor.setEmail("admin@gymnex.com");
				instrutor.setTelefone("999999999");
				instrutor.setEspecialidades("Musculação, Funcional");
				instrutor.setFotoPerfilUrl("https://ui-avatars.com/api/?name=Instrutor&background=0d6efd&color=fff");
				instrutor.setNotificacoesEmail(true);
				instrutor.setNotificacoesSms(false);
				instrutor.setTemaEscuro(false);
				instrutorRepository.save(instrutor);
			}
		};
	}
}