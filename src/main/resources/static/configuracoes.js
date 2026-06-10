'use strict'; // Ativa as regras rígidas do navegador para evitar erros bobos com variáveis soltas

const API_INSTRUTOR = '/instrutores/1'; // Rota para gerir o perfil do instrutor padrão (ID 1)
let instrutorAtual = {}; // Objeto que vai guardar a cópia dos dados que vêm do Firebase

// Garante que o HTML da página carregou todo antes de disparar o JavaScript
document.addEventListener('DOMContentLoaded', () => {
    ConfigController.init(); // Arranca com o controlador de configurações
});

// Objeto que cuida de toda a lógica da tela de configurações
const ConfigController = {
    // Função que dá o pontapé de saída e organiza as funções principais
    init: function() {
        this.cacheDOM(); // Mapeia os elementos do HTML
        this.bindEvents(); // Ativa os cliques e ações da tela
        this.initTheme(); // Carrega o tema (escuro/claro) que já estava ativo
        this.carregarDados(); // Puxa os dados do instrutor para preencher as caixinhas
    },

    // Salva os elementos do HTML em variáveis para não precisar de usar getElementById a toda a hora
    cacheDOM: function() {
        this.form = document.getElementById('form-config'); // O formulário com as opções de notificações e tema
        this.btnThemeToggle = document.getElementById('btn-theme-toggle'); // O botão flutuante de mudar o tema (Sol/Lua)
    },

    // Fica a ouvir as ações do utilizador no ecrã
    bindEvents: function() {
        this.form.addEventListener('submit', this.salvarDados.bind(this)); // Quando clica em salvar, dispara a função
        this.btnThemeToggle.addEventListener('click', this.toggleTheme.bind(this)); // Quando clica no Sol/Lua, muda o tema
    },

    // Faz um GET no Java para ler como estão as configurações atuais do instrutor no Firebase
    carregarDados: async function() {
        try {
            const res = await fetch(API_INSTRUTOR); // Faz o pedido dos dados do instrutor 1
            if (!res.ok) throw new Error(); // Se o servidor falhar, pula direto para o bloco de erro
            instrutorAtual = await res.json(); // Guarda os dados recebidos na nossa variável global

            // Marca ou desmarca os switches (checkboxes) com base no que veio do banco de dados
            document.getElementById('notificacoesEmail').checked = instrutorAtual.notificacoesEmail || false;
            document.getElementById('notificacoesSms').checked = instrutorAtual.notificacoesSms || false;
            document.getElementById('temaEscuro').checked = instrutorAtual.temaEscuro || false;

            this.atualizarSidebar(instrutorAtual); // Atualiza os dados do menu lateral com as informações recebidas
        } catch (error) {
            UIHelperConfig.showToast('Erro', 'Falha ao carregar configurações.', 'danger'); // Avisa se der erro de rede
        }
    },

    // Recolhe o estado atual dos switches e faz um PUT para gravar tudo no Firebase
    salvarDados: async function(event) {
        event.preventDefault(); // Bloqueia o recarregamento padrão da página ao enviar o formulário

        // Monta o novo JSON aproveitando os dados antigos (...instrutorAtual) e injetando as marcações atuais
        const dadosSalvar = {
            ...instrutorAtual,
            notificacoesEmail: document.getElementById('notificacoesEmail').checked,
            notificacoesSms: document.getElementById('notificacoesSms').checked,
            temaEscuro: document.getElementById('temaEscuro').checked
        };

        try {
            // Dispara a requisição PUT enviando o pacote completo atualizado
            const res = await fetch(API_INSTRUTOR, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosSalvar)
            });

            if (!res.ok) throw new Error(); // Se o servidor der erro, força a ida para o catch

            instrutorAtual = await res.json(); // Atualiza a nossa variável local com a resposta confirmada do servidor

            // Aplica a mudança de cores no ecrã e grava no localStorage na mesma hora
            const novoTema = instrutorAtual.temaEscuro ? 'dark' : 'light';
            this.applyTheme(novoTema);

            UIHelperConfig.showToast('Sucesso', 'Configurações updated.', 'success'); // Balão verde de sucesso
        } catch (error) {
            UIHelperConfig.showToast('Erro', 'Não foi possível salvar as configurações.', 'danger'); // Balão vermelho de erro
        }
    },

    // Injeta a foto e o nome do instrutor nos elementos corretos do menu lateral
    atualizarSidebar: function(instrutor) {
        const fotoEl = document.getElementById('sidebar-instrutor-foto'); // Pega a tag de imagem do menu
        const nomeEl = document.getElementById('sidebar-instrutor-nome'); // Pega a tag de texto do nome
        if(fotoEl) fotoEl.src = instrutor.fotoPerfilUrl || 'https://ui-avatars.com/api/?name=Instrutor&background=0d6efd&color=fff'; // Se não tiver foto cadastrada, gera um avatar temporário
        if(nomeEl) nomeEl.innerText = instrutor.nome || 'Instrutor'; // Se não tiver nome, deixa o texto padrão
    },

    // Procura na memória do navegador o tema que estava ativo da última vez
    initTheme: function() {
        const savedTheme = localStorage.getItem('gymnex_theme') || 'light'; // Se não achar nada, assume o modo claro por padrão
        this.applyTheme(savedTheme); // Manda rodar a pintura das cores
    },

    // Inverte as cores atuais do ecrã quando o utilizador clica no botão redondo de Sol/Lua
    toggleTheme: function() {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme'); // Vê qual é o tema que está ativo
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'; // Se tá claro vai pra escuro, se tá escuro vai pra claro
        this.applyTheme(newTheme); // Manda aplicar
    },

    // Troca os atributos do Bootstrap e altera visualmente os ícones do botão
    applyTheme: function(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme); // Muda as cores globais do Bootstrap na página
        localStorage.setItem('gymnex_theme', theme); // Salva a escolha no navegador para lembrar na próxima visita
        const btn = this.btnThemeToggle; // Atalho para o botão flutuante
        const icon = btn.querySelector('i'); // Pega a tag do ícone que fica dentro do botão
        if (theme === 'dark') {
            icon.classList.replace('fa-moon', 'fa-sun'); // Troca a Lua pelo Sol
            btn.classList.replace('btn-dark', 'btn-light'); // Ajusta as bordinhas do botão para o modo escuro
            btn.classList.replace('border-secondary', 'border-light');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon'); // Troca o Sol pela Lua
            btn.classList.replace('btn-light', 'btn-dark'); // Ajusta as bordinhas do botão para o modo claro
            btn.classList.replace('border-light', 'border-secondary');
        }
    }
};

// Classe utilitária especializada em fazer saltar balões de notificação (Toasts) no ecrã
class UIHelperConfig {
    static showToast(title, message, type = 'info') {
        const container = document.getElementById('toast-container'); // Acha a área reservada para os avisos no HTML
        const id = 'toast-' + Date.now(); // Cria um identificador único usando o timestamp do relógio
        let icon = type === 'success' ? 'fa-check-circle text-success' : 'fa-circle-xmark text-danger'; // Define se o ícone é de check (verde) ou erro (vermelho)

        // Constrói a estrutura do balão em HTML limpo
        const html = `
            <div id="${id}" class="toast border-0 shadow-sm" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header border-bottom-0"><i class="fa-solid ${icon} me-2 fs-5"></i><strong class="me-auto text-body-emphasis">${title}</strong><button type="button" class="btn-close" data-bs-dismiss="toast"></button></div>
                <div class="toast-body bg-body-tertiary rounded-bottom text-body">${message}</div>
            </div>`;
        container.insertAdjacentHTML('beforeend', html); // Joga o balão montado para dentro do container do site
        const bsToast = new bootstrap.Toast(document.getElementById(id), { delay: 4000 }); // Inicializa o componente configurado para sumir em 4 segundos
        bsToast.show(); // Faz o balão brotar com a animação de subida
        document.getElementById(id).addEventListener('hidden.bs.toast', () => document.getElementById(id).remove()); // Quando ele sumir, apaga a tag para limpar o código e não acumular lixo na página
    }
}