'use strict'; // Obriga o navegador a ser rígido com o código para evitar que deixemos passar erros bobos

const API_URL = '/alunos'; // O caminho para onde mandamos e de onde puxamos os dados dos alunos
const API_PLANOS = '/planos'; // O caminho para falar com a parte de planos no servidor
let alunosMemoria = []; // Uma lista vazia para guardar os alunos e podermos pesquisar sem ir ao servidor toda hora
let planosMemoria = []; // Uma lista vazia para segurar os planos e não perdermos os nomes deles na edição

// Espera o HTML da página carregar todo antes de disparar o JavaScript
document.addEventListener('DOMContentLoaded', () => {
    AppController.init(); // Arranca com o controlador principal da aplicação
});

// Objeto que cuida de toda a lógica da tela de gerir alunos
const AppController = {

    // Função que dá o pontapé de saída e organiza o que deve rodar primeiro
    init: async function() {
        this.cacheDOM(); // Mapeia os elementos do HTML
        this.bindEvents(); // Ativa os cliques e funções dos botões
        this.carregarInstrutorSidebar(); // Atualiza a foto e o nome do instrutor no menu
        this.initTheme(); // Vê se o tema escuro estava ativo e aplica
        await this.carregarPlanosParaEdicao(); // Puxa os planos do banco (espera terminar antes do próximo passo)
        this.listarAlunos(); // Por fim, joga os alunos na tabela do ecrã
    },

    // Guarda os elementos do HTML em variáveis para não ter de ficar caçando o ID toda hora
    cacheDOM: function() {
        this.form = document.getElementById('aluno-form'); // O formulário de dentro da janela de editar
        this.tbody = document.getElementById('tabela-alunos'); // Onde as linhas dos alunos vão ser inseridas
        this.inputBusca = document.getElementById('pesquisa-aluno'); // A barra de pesquisa
        this.modalCadastro = new bootstrap.Modal(document.getElementById('modalCadastroAluno')); // A janela pop-up de edição
        this.btnThemeToggle = document.getElementById('btn-theme-toggle'); // Botão de mudar o tema (Sol/Lua)
        this.statTotal = document.getElementById('stat-total-alunos'); // Onde mostra o total de matriculados
        this.statSmart = document.getElementById('stat-smartwatches'); // Onde mostra quantos usam relógio
        this.infoTabela = document.getElementById('tabela-info'); // Texto que diz quantos registos estão na tabela
    },

    // Escuta tudo o que o utilizador faz na tela e liga às funções certas
    bindEvents: function() {
        this.form.addEventListener('submit', this.salvarAluno.bind(this)); // Quando envia o formulário, salva o aluno
        this.inputBusca.addEventListener('input', this.filtrarTabela.bind(this)); // Quando digita na busca, filtra as linhas

        // Controla o quadradinho do Smartwatch para mostrar ou ocultar o campo do endereço MAC
        document.getElementById('edit-possuiSmartwatch').addEventListener('change', (e) => {
            const containerMac = document.getElementById('edit-container-mac'); // O bloco do campo MAC
            const macInput = document.getElementById('dispositivoMac'); // O input de texto do MAC
            if(e.target.checked) {
                containerMac.classList.remove('d-none'); // Se marcou que tem relógio, mostra o campo
                macInput.required = true; // Torna o campo obrigatório
            } else {
                containerMac.classList.add('d-none'); // Se desmarcou, esconde o campo
                macInput.required = false; // Tira a obrigação de preencher
                macInput.value = ''; // Limpa o texto que estava lá dentro
            }
        });

        // Formata o endereço MAC automaticamente enquanto a pessoa vai digitando
        const macInput = document.getElementById('dispositivoMac');
        macInput.addEventListener('input', function(e) {
            let val = e.target.value.replace(/[^A-Fa-f0-9]/g, '').toUpperCase(); // Limpa tudo o que não for letra ou número e põe em maiúsculas
            if (val.length > 0) val = val.match(/.{1,2}/g).join(':'); // Corta de 2 em 2 caracteres e coloca dois pontos ":" no meio
            e.target.value = val.substring(0, 17); // Bloqueia o tamanho máximo do MAC para não passar de 17 letras/pontos
        });

        // Limpa o campo do telefone para aceitar apenas números
        const telefoneInput = document.getElementById('telefone');
        if(telefoneInput) {
            telefoneInput.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); });
        }

        // Bloqueia números no campo da cidade, aceitando apenas letras e espaços
        const cidadeInput = document.getElementById('cidade');
        if(cidadeInput) {
            cidadeInput.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''); });
        }

        this.btnThemeToggle.addEventListener('click', this.toggleTheme.bind(this)); // Liga o clique do botão Sol/Lua à troca de tema
    },

    // Vai ao Java buscar os dados do perfil do instrutor do ID 1
    carregarInstrutorSidebar: async function() {
        try {
            const res = await fetch('/instrutores/1'); // Faz o pedido do instrutor número 1
            if (res.ok) {
                const instrutor = await res.json(); // Transforma a resposta em dados legíveis
                const fotoEl = document.getElementById('sidebar-instrutor-foto'); // Pega a imagem do menu
                const nomeEl = document.getElementById('sidebar-instrutor-nome'); // Pega o texto do nome do menu
                if(fotoEl) fotoEl.src = instrutor.fotoPerfilUrl || 'https://ui-avatars.com/api/?name=Instrutor&background=0d6efd&color=fff'; // Se não tiver foto, gera uma com as iniciais
                if(nomeEl) nomeEl.innerText = instrutor.nome || 'Instrutor Admin'; // Se não tiver nome, deixa o padrão do sistema
            }
        } catch(e) {} // Se der erro na rede ou no Firebase, ignora e não deixa a tela travar
    },

    // Puxa todos os planos cadastrados para colocar dentro da caixinha de seleção do formulário
    carregarPlanosParaEdicao: async function() {
        try {
            const response = await fetch(API_PLANOS); // Chama a rota dos planos no Java
            if(response.ok) {
                const planos = await response.json(); // Converte a lista de planos recebida
                planosMemoria = planos; // Guarda essa lista na memória global para podermos consultar depois
                const select = document.getElementById('edit-planoSelecionado'); // Pega o elemento select do HTML
                select.innerHTML = '<option value="" disabled>Escolha um plano...</option>'; // Reseta as opções antigas
                planos.forEach(p => {
                    select.innerHTML += `<option value="${p.id}">${p.nomePlano}</option>`; // Vai colocando cada plano como uma opção clicável
                });
            }
        } catch (error) {
            console.error('Erro ao carregar planos:', error); // Avisa no console do navegador se deu ruim
        }
    },

    // Puxa a lista de alunos do servidor e manda desenhar no ecrã
    listarAlunos: async function() {
        try {
            const response = await fetch(API_URL); // Faz o GET na rota dos alunos
            if (!response.ok) throw new Error(); // Se o servidor responder mal, força a ida para o bloco de erro
            const alunos = await response.json(); // Pega a lista convertida de alunos
            alunosMemoria = alunos; // Guarda os alunos na lista da memória para a pesquisa instantânea funcionar
            this.renderizarTabela(alunos); // Manda desenhar as linhas da tabela com os alunos reais
            this.atualizarEstatisticas(alunos); // Atualiza os números dos cards do topo da página
        } catch (error) {
            // Se der erro, avisa dentro da própria tabela que o servidor falhou
            this.tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4 fw-bold">Não foi possível carregar os dados do servidor.</td></tr>`;
        }
    },

    // Pega as alterações feitas no formulário e dispara um PUT para atualizar o aluno
    salvarAluno: async function(event) {
        event.preventDefault(); // Trava o envio padrão do HTML para a página não piscar/recarregar
        if (!this.form.checkValidity() || !this.validarMac()) {
            event.stopPropagation(); // Se tiver dados errados ou o MAC for inválido, para aqui
            this.form.classList.add('was-validated'); // Põe as bordinhas vermelhas do Bootstrap nos campos vazios
            return;
        }

        const id = document.getElementById('aluno-id').value; // Pega o ID (escondido) do aluno editado
        const possuiMac = document.getElementById('edit-possuiSmartwatch').checked; // Vê se o switch do relógio tá ativo
        const selectPlano = document.getElementById('edit-planoSelecionado'); // Pega a caixa de seleção de planos
        const planoId = selectPlano.value; // Pega o ID do plano selecionado

        let planoParaSalvar = null;

        if (planoId && planoId !== '') {
            // Varre a memória para achar o plano completo que bate com o ID selecionado
            const planoEncontrado = planosMemoria.find(p => String(p.id) === String(planoId));

            if (planoEncontrado) {
                planoParaSalvar = planoEncontrado; // Se achou na memória, pega o objeto inteiro
            } else {
                const nomeDoPlano = selectPlano.options[selectPlano.selectedIndex].text; // Caso falhe, captura o texto direto da opção do ecrã
                planoParaSalvar = { id: planoId, nomePlano: nomeDoPlano }; // Cria o objeto à força com ID e Nome para blindar o Firebase
            }
        }

        const statusAtivo = this.form.dataset.ativo !== 'false'; // Recupera se o aluno estava ativo ou inativo antes de abrir a edição

        // Monta o pacote de dados do aluno limpo e arrumado para despachar para a nuvem
        const dadosAluno = {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            dataNascimento: document.getElementById('dataNascimento').value,
            cidade: document.getElementById('cidade').value.trim(),
            condicaoMedica: document.getElementById('condicaoMedica').value.trim(),
            possuiSmartwatch: possuiMac,
            dispositivoMac: possuiMac ? document.getElementById('dispositivoMac').value.trim() : null, // Se não tiver relógio, grava nulo
            plano: planoParaSalvar, // Garante que o plano vai completo com nome e ID para não sumir nada
            ativo: statusAtivo
        };

        console.log("Enviando para o Firebase:", dadosAluno); // Print de segurança na consola para ver o JSON que vai ser enviado

        try {
            // Dispara a requisição PUT direto para a rota com o ID do aluno correspondente
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosAluno)
            });
            if (!response.ok) throw new Error('Erro'); // Se o Java rejeitar, estoura o erro
            this.modalCadastro.hide(); // Fecha a janela pop-up do formulário
            this.listarAlunos(); // Atualiza a tabela na mesma hora
            UIHelper.showToast('Sucesso', 'Ficha do aluno atualizada!', 'success'); // Mostra o balão verde de sucesso
        } catch (error) {
            UIHelper.showToast('Erro', 'Falha ao guardar os dados.', 'danger'); // Balão vermelho caso dê erro
        }
    },

    // Inverte o estado de Ativo para Inativo ou vice-versa ao clicar no botão de bloquear
    alternarStatus: async function(id, nome, statusAtual) {
        const acao = statusAtual ? 'Inativar' : 'Reativar'; // Decide a palavra certa para mostrar no aviso
        if (confirm(`Deseja ${acao} a ficha do aluno "${nome}"?`)) { // Cria o pop-up de confirmação do navegador
            try {
                const response = await fetch(`${API_URL}/${id}/status`, { method: 'PATCH' }); // Dispara um PATCH para mudar apenas o status na nuvem
                if (!response.ok) throw new Error('Falha');
                this.listarAlunos(); // Recarrega os registos
                UIHelper.showToast('Status Alterado', `O aluno ${nome} agora está ${statusAtual ? 'Inativo' : 'Ativo'}.`, 'warning'); // Notificação amarela
            } catch (error) {
                UIHelper.showToast('Erro', `Não foi possível ${acao}.`, 'danger');
            }
        }
    },

    // Varre a lista de alunos recebida e monta todo o código HTML da tabela linha por linha
    renderizarTabela: function(alunosArray) {
        this.tbody.innerHTML = ''; // Esvazia o corpo da tabela antiga
        this.infoTabela.innerText = `Exibindo ${alunosArray.length} registos`; // Atualiza o contador de linhas no rodapé da tabela

        if (alunosArray.length === 0) {
            this.tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-5">Nenhum aluno encontrado.</td></tr>`; // Alerta se a busca der vazia
            return;
        }

        alunosArray.forEach(aluno => {
            // Define o retângulo verde para ativos e vermelho para inativos
            const badgeAtivo = aluno.ativo
                ? `<span class="badge bg-success bg-opacity-10 text-success border border-success">ATIVO</span>`
                : `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger">INATIVO</span>`;

            // Configura o indicador do relógio sincronizado ou sem dispositivo
            const badgeHTML = aluno.possuiSmartwatch && aluno.dispositivoMac
                ? `<span class="status-badge status-active"><i class="fa-solid fa-check-circle"></i> Sincronizado</span><br><code class="mac-address mt-1 d-inline-block">${aluno.dispositivoMac}</code>`
                : `<span class="status-badge status-inactive"><i class="fa-solid fa-xmark"></i> Sem Smartwatch</span>`;

            // Tratamento especial para resgatar o nome do plano se por acaso ele estiver nulo no Firebase
            let nomePlano = '<span class="text-danger">Sem Plano</span>';
            if (aluno.plano) {
                if (aluno.plano.nomePlano && aluno.plano.nomePlano !== 'null') {
                    nomePlano = aluno.plano.nomePlano; // Se tem nome no banco, usa ele direto
                } else if (aluno.plano.id) {
                    const planoEncontrado = planosMemoria.find(p => String(p.id) === String(aluno.plano.id)); // Se só tem ID, busca na lista local para achar o nome
                    if (planoEncontrado && planoEncontrado.nomePlano) {
                        nomePlano = planoEncontrado.nomePlano;
                    }
                }
            }

            // Define os ícones e estilos dos botões dependendo se o aluno está ativo ou inativo
            const btnAcaoClass = aluno.ativo ? 'btn-outline-danger' : 'btn-outline-success';
            const btnAcaoIcon = aluno.ativo ? 'fa-ban' : 'fa-check';
            const btnAcaoTitle = aluno.ativo ? 'Inativar Aluno' : 'Reativar Aluno';
            const dadosStr = encodeURIComponent(JSON.stringify(aluno)); // Converte o objeto todo do aluno em texto seguro para enfiar no botão do HTML
            const trClass = aluno.ativo ? '' : 'opacity-50 bg-body-secondary'; // Esmaece a linha inteira deixando-a cinzenta se o aluno estiver inativo

            const btnEditDesativado = aluno.ativo ? '' : 'disabled'; // Bloqueia o clique no lápis se estiver inativo
            const tituloEdit = aluno.ativo ? 'Editar Ficha' : 'Reative o aluno para poder editar'; // Muda a frase que aparece ao passar o rato

            // Cospe a estrutura HTML inteira da linha na tabela com as informações reais injetadas
            this.tbody.innerHTML += `
                <tr class="${trClass}">
                    <td class="text-muted fw-bold ps-4" style="max-width: 80px; overflow: hidden; text-overflow: ellipsis;" title="${aluno.id}">#${aluno.id.substring(0,5)}</td>
                    <td class="fw-bold text-body-emphasis">
                        <div class="d-flex align-items-center">
                            <div class="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-3" style="width: 35px; height: 35px;">
                                ${aluno.nome.charAt(0).toUpperCase()}
                            </div>
                            <div>${aluno.nome} <br>${badgeAtivo}</div>
                        </div>
                    </td>
                    <td>
                        <div class="small"><i class="fa-solid fa-envelope text-muted me-1"></i> ${aluno.email}</div>
                        <div class="small mt-1"><i class="fa-solid fa-phone text-success me-1"></i> ${aluno.telefone || 'N/A'}</div>
                    </td>
                    <td class="fw-bold"><i class="fa-solid fa-tag text-warning me-1"></i> ${nomePlano}</td>
                    <td>${badgeHTML}</td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-primary shadow-sm me-1" title="${tituloEdit}" onclick="prepararEdicao('${dadosStr}')" ${btnEditDesativado}><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-sm ${btnAcaoClass} shadow-sm" title="${btnAcaoTitle}" onclick="AppController.alternarStatus('${aluno.id}', '${aluno.nome}', ${aluno.ativo})"><i class="fa-solid ${btnAcaoIcon}"></i></button>
                    </td>
                </tr>
            `;
        });
    },

    // Faz os cálculos e altera os números informativos dos blocos coloridos lá do topo
    atualizarEstatisticas: function(alunos) {
        const ativos = alunos.filter(a => a.ativo); // Separa só quem está ativo
        this.statTotal.innerText = ativos.length; // Coloca o total de ativos no primeiro painel
        this.statSmart.innerText = ativos.filter(a => a.possuiSmartwatch).length; // Vê quantos desses ativos têm relógio e joga no segundo painel
    },

    // Filtra as linhas da tabela em tempo real com base no que é digitado no campo de busca
    filtrarTabela: function(e) {
        const t = e.target.value.toLowerCase(); // Pega o termo digitado convertido para letras minúsculas
        const filt = alunosMemoria.filter(a => a.nome.toLowerCase().includes(t) || a.email.toLowerCase().includes(t)); // Mantém na lista só quem tem o termo no nome ou email
        this.renderizarTabela(filt); // Manda desenhar a tabela de novo com a lista filtrada
    },

    // Validação de segurança para conferir se o endereço MAC está preenchido corretamente
    validarMac: function() {
        if(!document.getElementById('edit-possuiSmartwatch').checked) return true; // Se o switch de relógio tá desligado, não precisa validar e aprova direto
        const macVal = document.getElementById('dispositivoMac').value.trim(); // Pega o endereço MAC escrito
        if (/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(macVal)) return true; // Verifica se cumpre o formato de pares padrão (Ex: AA:BB:CC:DD:EE:FF)
        document.getElementById('mac-feedback').style.display = 'block'; // Se falhar na verificação, força o alerta de erro a aparecer no ecrã
        return false;
    },

    // Carrega a escolha de cor padrão do utilizador (Modo Escuro / Modo Claro) guardada no navegador
    initTheme: function() {
        const savedTheme = localStorage.getItem('gymnex_theme') || 'light'; // Procura o tema ativo, se não achar nenhum assume o Modo Claro
        this.applyTheme(savedTheme); // Manda aplicar
    },

    // Inverte as cores quando o utilizador clica no ícone da lua ou do sol
    toggleTheme: function() {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme'); // Lê as cores que estão no ecrã
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'; // Se tá claro vai pra escuro, se tá escuro vai pra claro
        this.applyTheme(newTheme); // Manda aplicar o inverso
    },

    // Injeta os atributos CSS na tag HTML do site e ajusta visualmente os botões
    applyTheme: function(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme); // Aplica no Bootstrap o tema escolhido
        localStorage.setItem('gymnex_theme', theme); // Salva a escolha na memória local do navegador para a próxima visita
        const btn = this.btnThemeToggle; // Atalho para o botão do tema
        const icon = btn.querySelector('i'); // Captura a tag de ícone que fica dentro do botão
        if (theme === 'dark') {
            icon.classList.replace('fa-moon', 'fa-sun'); // Troca a Lua pelo Sol
            btn.classList.replace('btn-dark', 'btn-light'); // Troca o fundo do botão para claro
            btn.classList.replace('border-secondary', 'border-light');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon'); // Troca o Sol pela Lua
            btn.classList.replace('btn-light', 'btn-dark'); // Torna o botão escuro
            btn.classList.replace('border-light', 'border-secondary');
        }
    }
};

// Abre a janela de edição preenchendo todos os inputs com as informações atuais daquele aluno específico
window.prepararEdicao = function(alunoCodificado) {
    const aluno = JSON.parse(decodeURIComponent(alunoCodificado)); // Reverte o texto codificado de volta para um objeto legível do JavaScript
    const form = document.getElementById('aluno-form');
    form.classList.remove('was-validated'); // Limpa os avisos vermelhos de erro deixados por edições anteriores

    form.dataset.ativo = aluno.ativo; // Memoriza discretamente nas propriedades do formulário se o aluno é ativo ou inativo

    // Injeta o conteúdo do aluno selecionado dentro de cada caixinha de input correspondente
    document.getElementById('aluno-id').value = aluno.id;
    document.getElementById('nome').value = aluno.nome;
    document.getElementById('email').value = aluno.email;
    document.getElementById('telefone').value = aluno.telefone;
    document.getElementById('dataNascimento').value = aluno.dataNascimento;
    document.getElementById('cidade').value = aluno.cidade;
    document.getElementById('condicaoMedica').value = aluno.condicaoMedica || ''; // Se a ficha médica estiver vazia, põe texto em branco para não mostrar 'null'

    const selectPlano = document.getElementById('edit-planoSelecionado');
    if(aluno.plano && aluno.plano.id) {
        selectPlano.value = aluno.plano.id; // Encontra e seleciona o plano correspondente na caixa de opções
    } else {
        selectPlano.value = ''; // Se não tinha plano, deixa a caixa em branco
    }

    const checkSmart = document.getElementById('edit-possuiSmartwatch');
    const containerMac = document.getElementById('edit-container-mac');
    const inputMac = document.getElementById('dispositivoMac');

    checkSmart.checked = aluno.possuiSmartwatch; // Marca a caixa do interruptor se ele tiver relógio
    if(aluno.possuiSmartwatch) {
        containerMac.classList.remove('d-none'); // Abre o campo de digitação do MAC
        inputMac.required = true;
        inputMac.value = aluno.dispositivoMac || '';
    } else {
        containerMac.classList.add('d-none'); // Tranca o bloco do MAC se ele não tiver relógio
        inputMac.required = false;
        inputMac.value = '';
    }

    AppController.modalCadastro.show(); // Abre visualmente a janela flutuante no meio do ecrã
};

// Classe utilitária especializada em fazer saltar avisos temporários (Toasts) na interface gráfica
class UIHelper {
    static showToast(title, message, type = 'info') {
        const container = document.getElementById('toast-container'); // Localiza a área reservada para os alertas
        const id = 'toast-' + Date.now(); // Cria um ID único misturando a palavra com a hora e milissegundos atuais
        let icon = type === 'success' ? 'fa-check-circle text-success' : type === 'danger' ? 'fa-circle-xmark text-danger' : 'fa-circle-info text-warning'; // Decide o ícone baseado no tipo de aviso

        // Constrói a estrutura HTML crua do alerta temporário
        const html = `
            <div id="${id}" class="toast border-0 shadow-sm" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header border-bottom-0"><i class="fa-solid ${icon} me-2 fs-5"></i><strong class="me-auto text-body-emphasis">${title}</strong><button type="button" class="btn-close" data-bs-dismiss="toast"></button></div>
                <div class="toast-body bg-body-tertiary rounded-bottom text-body">${message}</div>
            </div>`;

        container.insertAdjacentHTML('beforeend', html); // Enfia o código HTML criado no final do contentor de alertas
        const bsToast = new bootstrap.Toast(document.getElementById(id), { delay: 4000 }); // Inicializa o componente usando as regras do Bootstrap configurado para sumir após 4 segundos
        bsToast.show(); // Faz o alerta subir no ecrã com animação
        document.getElementById(id).addEventListener('hidden.bs.toast', () => document.getElementById(id).remove()); // Quando ele sumir de vez sozinho, apaga a tag do código para não acumular lixo na memória da página
    }
}