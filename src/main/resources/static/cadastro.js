'use strict'; // Ativa o modo rígido do navegador para evitar que a gente cometa erros bobos de digitação

const API_URL = '/alunos'; // Rota para onde vamos enviar o cadastro do novo aluno
const API_PLANOS = '/planos'; // Rota de onde puxamos os planos disponíveis no sistema

// Espera a tela (HTML) carregar 100% antes de deixar o JavaScript rodar
document.addEventListener('DOMContentLoaded', () => {
    CadastroController.init(); // Inicia o controlador da tela de cadastro
});

// Objeto central que organiza tudo o que acontece nesta tela
const CadastroController = {
    // Função principal que organiza a ordem de carregamento das coisas
    init: function() {
        this.cacheDOM(); // Mapeia os elementos do HTML
        this.bindEvents(); // Ativa os cliques e escutas de eventos
        this.carregarPlanos(); // Busca os planos cadastrados no Firebase para listar na caixinha
        this.initTheme(); // Verifica se o modo escuro deve iniciar ativo
    },

    // Guarda as caixas/elementos do HTML em variáveis para não precisar ficar buscando pelo ID toda hora
    cacheDOM: function() {
        this.form = document.getElementById('form-cadastro-aluno'); // Pega o formulário de cadastro inteiro
        this.btnThemeToggle = document.getElementById('btn-theme-toggle'); // Pega o botão flutuante de Sol/Lua
    },

    // Monitora as ações do usuário (cliques, digitação, marcações)
    bindEvents: function() {
        this.form.addEventListener('submit', this.salvarAluno.bind(this)); // Quando clicar em enviar, roda a função de salvar

        // Monitora o interruptor (checkbox) do Smartwatch para mostrar ou sumir com o campo do MAC
        document.getElementById('possuiSmartwatch').addEventListener('change', (e) => {
            const containerMac = document.getElementById('container-mac'); // Bloco onde fica o campo do MAC
            const macInput = document.getElementById('dispositivoMac'); // O campo de texto do MAC em si
            if(e.target.checked) {
                containerMac.classList.remove('d-none'); // Se o relógio tá marcado, mostra o campo na tela
                macInput.required = true; // Torna o preenchimento do MAC obrigatório
            } else {
                containerMac.classList.add('d-none'); // Se desmarcou, esconde o campo
                macInput.required = false; // Tira a obrigação de preencher
                macInput.value = ''; // Limpa qualquer texto que tenha ficado digitado ali
            }
        });

        // Formata o endereço MAC automaticamente com dois pontos ":" enquanto o usuário digita
        const macInput = document.getElementById('dispositivoMac');
        macInput.addEventListener('input', function(e) {
            let val = e.target.value.replace(/[^A-Fa-f0-9]/g, '').toUpperCase(); // Remove tudo o que não for letra/número hexadecimal e põe em maiúsculo
            if (val.length > 0) val = val.match(/.{1,2}/g).join(':'); // Separa o texto de 2 em 2 caracteres e junta colocando ":" no meio
            e.target.value = val.substring(0, 17); // Trava o tamanho em 17 caracteres para não deixar passar do limite do MAC
        });

        this.btnThemeToggle.addEventListener('click', this.toggleTheme.bind(this)); // Configura o clique do botão Sol/Lua para mudar o tema
    },

    // Vai buscar lá no servidor Java os planos cadastrados no banco para preencher o menu suspenso
    carregarPlanos: async function() {
        try {
            const response = await fetch(API_PLANOS); // Dispara um pedido GET para a rota de planos
            if (response.ok) {
                const planos = await response.json(); // Se deu certo, converte a resposta para uma lista legível
                const select = document.getElementById('planoSelecionado'); // Pega a caixinha select do HTML
                select.innerHTML = '<option value="" disabled selected>Selecione o Plano Desejado *</option>'; // Zera as opções antigas
                planos.forEach(p => {
                    select.innerHTML += `<option value="${p.id}">${p.nomePlano} - R$ ${p.preco}</option>`; // Vai colocando cada plano como uma nova opção com o preço em Reais
                });
            }
        } catch (error) {
            console.error('Erro ao carregar planos:', error); // Mostra o erro no console interno caso a rede caia
            document.getElementById('planoSelecionado').innerHTML = '<option value="" disabled selected>Erro ao carregar planos</option>'; // Exibe mensagem de erro na própria caixinha
        }
    },

    // Peta as informações digitadas e manda um POST para registrar o aluno no Firebase
    salvarAluno: async function(event) {
        event.preventDefault(); // Trava o envio padrão do HTML para evitar que a tela pisque ou recarregue do nada

        // Valida se todos os campos obrigatórios estão preenchidos e se o endereço MAC faz sentido
        if (!this.form.checkValidity() || !this.validarMac()) {
            event.stopPropagation(); // Se tiver erro, interrompe o salvamento aqui mesmo
            this.form.classList.add('was-validated'); // Adiciona as classes do Bootstrap para pintar as bordas de vermelho
            return;
        }

        const possuiMac = document.getElementById('possuiSmartwatch').checked; // Vê se o switch do relógio tá ligado

        // Captura o ID e o Nome do plano selecionado direto da tela para enviar completo para o banco
        const selectPlano = document.getElementById('planoSelecionado'); // Pega o select de planos
        const planoId = selectPlano.value; // Pega o valor (ID) do plano escolhido
        const nomeDoPlano = planoId ? selectPlano.options[selectPlano.selectedIndex].text.split(' - ')[0] : null; // Se escolheu plano, extrai só o texto do nome (antes do traço do preço)

        // Junta todos os dados limpos em um único pacote pronto para enviar
        const dadosAluno = {
            nome: document.getElementById('nome').value.trim(), // Pega o nome tirando os espaços sobrando nas pontas
            email: document.getElementById('email').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            dataNascimento: document.getElementById('dataNascimento').value,
            cidade: document.getElementById('cidade').value.trim(),
            condicaoMedica: document.getElementById('condicaoMedica').value.trim(),
            possuiSmartwatch: possuiMac,
            dispositivoMac: possuiMac ? document.getElementById('dispositivoMac').value.trim() : null, // Se não tiver relógio, manda nulo
            plano: planoId ? { id: planoId, nomePlano: nomeDoPlano } : null // Envia o ID e o Nome estruturados para não sumir dados no NoSQL
        };

        try {
            // Dispara o pedido POST para salvar o novo aluno enviando o pacote como JSON
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosAluno)
            });

            if (!response.ok) throw new Error('Erro ao salvar no servidor'); // Se o backend rejeitar, pula pro catch

            UIHelper.showToast('Sucesso', 'Aluno matriculado com sucesso!', 'success'); // Mostra a caixinha verde flutuante de sucesso
            setTimeout(() => { window.location.href = 'index.html'; }, 2000); // Aguarda 2 segundos e joga o usuário de volta para o painel principal
        } catch (error) {
            UIHelper.showToast('Erro', 'Não foi possível cadastrar o aluno.', 'danger'); // Mostra a caixinha vermelha de falha
        }
    },

    // Teste de segurança com expressão regular para conferir se o formato do MAC está certo
    validarMac: function() {
        if(!document.getElementById('possuiSmartwatch').checked) return true; // Se não tem relógio, não tem o que validar, então aprova direto
        const macVal = document.getElementById('dispositivoMac').value.trim(); // Pega o texto do MAC escrito
        if (/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(macVal)) return true; // Testa o formato padrão (Ex: AA:BB:CC:DD:EE:FF). Se estiver correto, aprova
        document.getElementById('mac-feedback').style.display = 'block'; // Se o formato estiver errado, força o texto de aviso a aparecer na tela
        return false;
    },

    // Puxa o tema (claro ou escuro) que o usuário escolheu antes e deixou salvo no navegador
    initTheme: function() {
        const savedTheme = localStorage.getItem('gymnex_theme') || 'light'; // Se não tiver nada salvo, inicia no Modo Claro por padrão
        this.applyTheme(savedTheme); // Manda aplicar o tema encontrado
    },

    // Faz o inverso do tema atual na hora que o usuário clica no botão de trocar
    toggleTheme: function() {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme'); // Vê qual cor tá na tela agora
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'; // Se tá claro vira escuro, se tá escuro vira claro
        this.applyTheme(newTheme); // Manda aplicar a nova cor escolhida
    },

    // Injeta os atributos necessários no Bootstrap e ajusta visualmente os ícones do botão
    applyTheme: function(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme); // Aplica a paleta de cores do Bootstrap na página
        localStorage.setItem('gymnex_theme', theme); // Guarda a preferência na memória do navegador
        const btn = this.btnThemeToggle; // Atalho para o botão flutuante
        const icon = btn.querySelector('i'); // Pega a tag do ícone de desenho
        if (theme === 'dark') {
            icon.classList.replace('fa-moon', 'fa-sun'); // Se ficou escuro, transforma a lua em sol
            btn.classList.replace('btn-dark', 'btn-light'); // Ajusta as bordinhas e cor do botão flutuante para destacar no escuro
            btn.classList.replace('border-secondary', 'border-light');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon'); // Se ficou claro, transforma o sol em lua
            btn.classList.replace('btn-light', 'btn-dark'); // Ajusta as bordinhas e cor do botão flutuante para destacar no claro
            btn.classList.replace('border-light', 'border-secondary');
        }
    }
};

// Classe utilitária focada apenas em gerar balões de notificação (Toasts) na tela
class UIHelper {
    static showToast(title, message, type = 'info') {
        const container = document.getElementById('toast-container'); // Acha a área invisível onde os avisos se acumulam
        const id = 'toast-' + Date.now(); // Gera um ID único usando os milissegundos do relógio para não dar conflito
        let icon = type === 'success' ? 'fa-check-circle text-success' : 'fa-circle-xmark text-danger'; // Escolhe o ícone verde ou vermelho

        // Monta a estrutura em HTML do balão que vai brotar na tela
        const html = `
            <div id="${id}" class="toast border-0 shadow-sm" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header border-bottom-0"><i class="fa-solid ${icon} me-2 fs-5"></i><strong class="me-auto text-body-emphasis">${title}</strong><button type="button" class="btn-close" data-bs-dismiss="toast"></button></div>
                <div class="toast-body bg-body-tertiary rounded-bottom text-body">${message}</div>
            </div>`;
        container.insertAdjacentHTML('beforeend', html); // Joga o HTML criado para dentro do container do site
        new bootstrap.Toast(document.getElementById(id), { delay: 4000 }).show(); // Faz o Bootstrap animar e sumir com ele da tela após 4 segundos
    }
}