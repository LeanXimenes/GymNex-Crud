package com.academia.gymnex.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void init() {
        try {
            // Vai procurar o ficheiro exatamente onde você o colocou (resources)
            InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream("firebase-service-account.json");

            if (serviceAccount == null) {
                System.err.println("❌ ATENÇÃO: O ficheiro firebase-service-account.json não foi encontrado!");
                return;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            // Se o FFirebase ainda não estiver ligado, ele liga agora
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("🚀 CONEXÃO COM O FIREBASE BEM SUCEDIDA! 🚀");
            }
        } catch (Exception e) {
            System.err.println("❌ Erro ao conectar ao Firebase: " + e.getMessage());
            e.printStackTrace();
        }
    }
}