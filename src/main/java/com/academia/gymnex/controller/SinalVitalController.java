// Define o pacote onde esta classe está guardada
package com.academia.gymnex.controller;

// Importa as anotações básicas de rota REST
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// @RestController: marca esta classe como um controlador que responde a chamadas HTTP
// @RequestMapping("/sinais-vitais"): a rota base desta classe é /sinais-vitais
@RestController
@RequestMapping("/sinais-vitais")
public class SinalVitalController {
    // Classe criada para reservar a rota /sinais-vitais no sistema.
    // Os métodos de cadastro e listagem de sinais vitais serão implementados futuramente.
}