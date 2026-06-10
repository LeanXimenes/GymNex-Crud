// Define o pacote onde esta classe está guardada
package com.academia.gymnex.config;

// Diz ao Spring que esta classe tem configurações do servidor web
import org.springframework.context.annotation.Configuration;
// Importa o registro de controladores de rotas simples
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
// Importa a interface que permite personalizar o comportamento do servidor web
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// @Configuration: marca esta classe como configuração do Spring Boot
@Configuration
// WebMvcConfigurer: ao implementar esta interface, conseguimos personalizar as rotas do servidor
public class WebConfig implements WebMvcConfigurer {

    // addViewControllers: método que registra redirecionamentos simples de URL
    // É chamado automaticamente pelo Spring Boot na inicialização
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Quando o usuário acessar apenas "/" (raiz do site, ex: localhost:8081/),
        // o servidor redireciona automaticamente para a página de login
        registry.addRedirectViewController("/", "/login.html");
    }
}