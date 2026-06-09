package com.academia.gymnex.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// @Configuration avisa o Spring Boot que esta classe muda as configurações do servidor.
@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Este método ensina o servidor a lidar com as rotas (URLs) digitadas no navegador.
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Regra de Ouro: Sempre que alguém digitar apenas "localhost:8081/" (raiz),
        // o servidor redireciona automaticamente (RedirectView) para a tela "/login.html".
        registry.addRedirectViewController("/", "/login.html");
    }
}