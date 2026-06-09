'use strict';

// Importando os módulos diretamente da Web (CDNs estáveis do Firebase)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// O seu objeto de configuração que copiou do console do Firebase!
const firebaseConfig = {
  apiKey: "AIzaSyBebBM5WGA7psFR-k_QZqaXKDzq-BF8Y_o",
  authDomain: "gymnex-crud.firebaseapp.com",
  projectId: "gymnex-crud",
  storageBucket: "gymnex-crud.firebasestorage.app",
  messagingSenderId: "693305995738",
  appId: "1:693305995738:web:6e53c0d98c73df3db510e3"
};

// Inicializa o aplicativo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Escuta o envio do formulário de Login
document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const btnEntrar = document.getElementById('btn-entrar');
    const erroMsg = document.getElementById('erro-msg');

    // Esconde mensagens de erro anteriores
    erroMsg.style.display = 'none';

    try {
        // Estado de carregamento no botão
        btnEntrar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Autenticando...';
        btnEntrar.disabled = true;

        // Efetua o login no Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);

        // Se o login funcionar, pegamos o Token de Segurança (JWT) gerado pelo Firebase
        const token = await userCredential.user.getIdToken();

        // Guarda o token no navegador para sabermos que o Instrutor está logado
        localStorage.setItem('gymnex_token', token);

        // Redireciona o instrutor para a página principal (Painel Administrativo)
        window.location.href = 'index.html';

    } catch (error) {
        console.error("Erro ao fazer login:", error);

        // Mostra a mensagem vermelha de erro
        erroMsg.style.display = 'block';

        // Restaura o botão
        btnEntrar.innerHTML = '<i class="fa-solid fa-right-to-bracket me-2"></i> Entrar no Sistema';
        btnEntrar.disabled = false;
    }
});