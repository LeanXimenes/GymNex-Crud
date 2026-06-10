// Define o pacote onde esta classe está guardada
package com.academia.gymnex.config;

// Importa a classe que lê as credenciais do Google (chave do Firebase)
import com.google.auth.oauth2.GoogleCredentials;
// Importa a classe principal do Firebase para criar a conexão
import com.google.firebase.FirebaseApp;
// Importa a classe que guarda as opções de configuração da conexão Firebase
import com.google.firebase.FirebaseOptions;
// Diz ao Spring Boot que esta classe tem configurações do sistema
import org.springframework.context.annotation.Configuration;

// Importa a anotação que executa o método logo após o servidor subir
import jakarta.annotation.PostConstruct;
// Importa a classe para ler arquivos como fluxo de dados (stream)
import java.io.InputStream;

// @Configuration: marca esta classe como uma classe de configuração do Spring.
// O Spring Boot vai lê-la automaticamente ao iniciar.
@Configuration
public class FirebaseConfig {

    // @PostConstruct: este método roda uma vez, logo depois que o servidor sobe.
    // É aqui que fazemos a ligação com o banco de dados na nuvem (Firebase).
    @PostConstruct
    public void init() {
        try {
            // Procura o arquivo de credenciais dentro da pasta resources do projeto.
            // Este arquivo tem a "chave secreta" para acessar o Firebase.
            InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream("firebase-service-account.json");

            // Se o arquivo não foi encontrado, exibe um aviso e para aqui
            if (serviceAccount == null) {
                System.err.println("❌ ATENÇÃO: O ficheiro firebase-service-account.json não foi encontrado!");
                return;
            }

            // Cria as opções de conexão usando as credenciais lidas do arquivo JSON
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount)) // usa a chave para autenticar
                    .build();

            // Verifica se o Firebase ainda não foi inicializado (evita inicializar duas vezes)
            if (FirebaseApp.getApps().isEmpty()) {
                // Inicializa o Firebase com as opções criadas acima
                FirebaseApp.initializeApp(options);
                // Mensagem de sucesso no console do servidor
                System.out.println("🚀 CONEXÃO COM O FIREBASE BEM SUCEDIDA! 🚀");
            }
        } catch (Exception e) {
            // Se der qualquer erro, mostra a mensagem no console
            System.err.println("❌ Erro ao conectar ao Firebase: " + e.getMessage());
            // Imprime a pilha de erros completa para facilitar o diagnóstico
            e.printStackTrace();
        }
    }
}