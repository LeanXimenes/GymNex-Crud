'use strict'; // Ativa o modo estrito do JavaScript — ajuda a pegar erros mais cedo

// Endereço base da API de alunos no servidor
const API_URL = '/alunos';
// Endereço base da API de planos no servidor
const API_PLANOS = '/planos';
// Lista que guarda todos os alunos em memória para filtrar sem precisar chamar o servidor novamente
let alunosMemoria = [];
// Lista que guarda todos os planos completos em memória (com nome, preço e duração)
let planosMemoria = [];

// Aguarda o HTML da página terminar de carregar antes de executar qualquer código
document.addEventListener('DOMContentLoaded', () => {
    // Chama o método que inicia tudo na página
    AppController.init();
});

// AppController: objeto principal que controla toda a lógica da página de alunos (index.html)
const AppController = {

    // init: primeiro método que roda — organiza a inicialização da página em etapas
    init: function() {
        this.cacheDOM();                    // guarda referências aos elementos HTML
        this.bindEvents();                  // registra os eventos (cliques, inputs, etc.)
        this.carregarInstrutorSidebar();    // carrega o nome e foto do instrutor no menu lateral
        this.initTheme();                   // aplica o tema (claro ou escuro) salvo anteriormente
        this.listarAlunos();               // carrega e exibe a lista de alunos na tabela
        this.carregarPlanosParaEdicao();   // carrega os planos no dropdown do formulário de edição
    },

    // cacheDOM: guarda referências aos elementos do HTML numa variável para não precisar
    // chamar document.getElementById toda hora — é mais rápido e organizado
    cacheDOM: function() {
        this.form = document.getElementById('aluno-form');                             // formulário de edição do aluno
        this.tbody = document.getElementById('tabela-alunos');                         // corpo da tabela de alunos
        this.inputBusca = document.getElementById('pesquisa-aluno');                   // campo de pesquisa
        this.modalCadastro = new bootstrap.Modal(document.getElementById('modalCadastroAluno')); // janela modal
        this.btnThemeToggle = document.getElementById('btn-theme-toggle');             // botão de alternar tema
        this.statTotal = document.getElementById('stat-total-alunos');                 // card com total de alunos ativos
        this.statSmart = document.getElementById('stat-smartwatches');                 // card com total de smartwatches
        this.infoTabela = document.getElementById('tabela-info');                      // texto com quantidade exibida
    },

    // bindEvents: conecta cada elemento HTML ao seu comportamento JavaScript
    bindEvents: function() {
        // Quando o formulário for enviado (botão "Guardar Alterações"), chama salvarAluno
        this.form.addEventListener('submit', this.salvarAluno.bind(this));
        // Quando o usuário digitar na pesquisa, filtra a tabela em tempo real
        this.inputBusca.addEventListener('input', this.filtrarTabela.bind(this));

        // Quando o switch de "Possui Smartwatch?" mudar de estado
        document.getElementById('edit-possuiSmartwatch').addEventListener('change', (e) => {
            const containerMac = document.getElementById('edit-container-mac'); // campo que mostra/esconde o MAC
            const macInput = document.getElementById('dispositivoMac');         // input do endereço MAC
            if(e.target.checked) {
                // Se o switch foi ativado: mostra o campo MAC e torna obrigatório
                containerMac.classList.remove('d-none');
                macInput.required = true;
            } else {
                // Se o switch foi desativado: esconde o campo MAC, remove a obrigatoriedade e limpa o valor
                containerMac.classList.add('d-none');
                macInput.required = false;
                macInput.value = '';
            }
        });

        // Formata automaticamente o endereço MAC enquanto o usuário digita
        const macInput = document.getElementById('dispositivoMac');
        macInput.addEventListener('input', function(e) {
            // Remove tudo que não for letra A-F ou número 0-9
            let val = e.target.value.replace(/[^A-Fa-f0-9]/g, '').toUpperCase();
            // Agrupa os caracteres em pares separados por ":"
            if (val.length > 0) val = val.match(/.{1,2}/g).join(':');
            // Limita o valor ao tamanho máximo de um endereço MAC (17 caracteres: AA:BB:CC:DD:EE:FF)
            e.target.value = val.substring(0, 17);
        });

        // Garante que só números sejam digitados no campo de telefone
        const telefoneInput = document.getElementById('telefone');
        if(telefoneInput) {
            telefoneInput.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); });
        }
        // Garante que só letras (incluindo acentos) sejam digitadas no campo de cidade
        const cidadeInput = document.getElementById('cidade');
        if(cidadeInput) {
            cidadeInput.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''); });
        }

        // Quando o botão de tema for clicado, chama o método que alterna entre claro e escuro
        this.btnThemeToggle.addEventListener('click', this.toggleTheme.bind(this));
    },

    // carregarInstrutorSidebar: busca os dados do instrutor no servidor e atualiza o menu lateral
    carregarInstrutorSidebar: async function() {
        try {
            // Faz uma requisição GET para buscar o instrutor com ID "1"
            const res = await fetch('/instrutores/1');
            if (res.ok) {
                const instrutor = await res.json(); // converte a resposta para objeto JavaScript
                const fotoEl = document.getElementById('sidebar-instrutor-foto'); // elemento da foto
                const nomeEl = document.getElementById('sidebar-instrutor-nome'); // elemento do nome
                // Define a foto — se não tiver, usa um avatar gerado automaticamente
                if(fotoEl) fotoEl.src = instrutor.fotoPerfilUrl || 'https://ui-avatars.com/api/?name=Instrutor&background=0d6efd&color=fff';
                // Define o nome — se não tiver, usa "Instrutor Admin"
                if(nomeEl) nomeEl.innerText = instrutor.nome || 'Instrutor Admin';
            }
        } catch(e) {} // se der erro, ignora silenciosamente (não quebra a página)
    },

    // carregarPlanosParaEdicao: busca os planos do servidor e preenche o dropdown de planos
    carregarPlanosParaEdicao: async function() {
        try {
            const response = await fetch(API_PLANOS); // GET /planos
            if(response.ok) {
                const planos = await response.json(); // converte resposta em array de planos
                planosMemoria = planos; // guarda os planos completos em memória para usar no salvar
                const select = document.getElementById('edit-planoSelecionado'); // dropdown de planos
                select.innerHTML = '<option value="" disabled>Escolha um plano...</option>'; // opção padrão
                // Adiciona um <option> para cada plano retornado pelo servidor
                planos.forEach(p => {
                    select.innerHTML += `<option value="${p.id}">${p.nomePlano}</option>`;
                });
            }
        } catch (error) {
            console.error('Erro ao carregar planos:', error); // exibe erro no console do navegador
        }
    },

    // listarAlunos: busca todos os alunos do servidor e renderiza na tabela
    listarAlunos: async function() {
        try {
            const response = await fetch(API_URL); // GET /alunos
            if (!response.ok) throw new Error(); // se o servidor retornar erro, lança uma exceção
            const alunos = await response.json(); // converte a resposta em array de alunos
            alunosMemoria = alunos; // guarda em memória para a pesquisa funcionar sem chamar servidor
            this.renderizarTabela(alunos); // monta as linhas da tabela com os alunos
            this.atualizarEstatisticas(alunos); // atualiza os cards de estatísticas no topo
        } catch (error) {
            // Se der erro, exibe uma mensagem de falha dentro da tabela
            this.tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4 fw-bold">Não foi possível carregar os dados do servidor.</td></tr>`;
        }
    },

    // salvarAluno: coleta os dados do formulário e envia para o servidor via PUT
    salvarAluno: async function(event) {
        event.preventDefault(); // impede o comportamento padrão de recarregar a página

        // Verifica se o formulário passou na validação nativa do HTML e se o MAC é válido
        if (!this.form.checkValidity() || !this.validarMac()) {
            event.stopPropagation(); // para a propagação do evento
            this.form.classList.add('was-validated'); // ativa os feedbacks visuais de validação
            return; // para aqui sem salvar
        }

        const id = document.getElementById('aluno-id').value;            // ID do aluno que está sendo editado
        const possuiMac = document.getElementById('edit-possuiSmartwatch').checked; // true se tem smartwatch
        const planoId = document.getElementById('edit-planoSelecionado').value;     // ID do plano escolhido

        // Busca o objeto completo do plano na memória usando o ID selecionado.
        // Isso garante que o nome, preço e duração do plano sejam salvos corretamente no Firebase.
        const planoCompleto = planosMemoria.find(p => p.id === planoId) || null;

        // Lê o status atual do aluno (guardado no campo oculto quando o modal foi aberto)
        const alunoAtivoStr = document.getElementById('aluno-ativo').value;

        // Monta o objeto com todos os dados do aluno para enviar ao servidor
        const dadosAluno = {
            nome: document.getElementById('nome').value.trim(),                // nome sem espaços extras
            email: document.getElementById('email').value.trim(),              // e-mail sem espaços extras
            telefone: document.getElementById('telefone').value.trim(),        // telefone
            dataNascimento: document.getElementById('dataNascimento').value,   // data no formato YYYY-MM-DD
            cidade: document.getElementById('cidade').value.trim(),            // cidade
            condicaoMedica: document.getElementById('condicaoMedica').value.trim(), // condição médica
            possuiSmartwatch: possuiMac,                                       // boolean: tem ou não tem smartwatch
            // Se tem smartwatch, inclui o MAC; se não, envia null
            dispositivoMac: possuiMac ? document.getElementById('dispositivoMac').value.trim() : null,
            plano: planoCompleto,  // objeto completo do plano (com id, nomePlano, preco, duracaoMeses)
            // Converte o texto "true"/"false" do campo oculto para boolean real
            ativo: alunoAtivoStr !== 'false'
        };

        try {
            // Envia os dados para o servidor via PUT /alunos/{id}
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }, // avisa que está enviando JSON
                body: JSON.stringify(dadosAluno)                  // converte o objeto para string JSON
            });
            if (!response.ok) throw new Error('Erro'); // se o servidor retornou erro, lança exceção
            this.modalCadastro.hide();   // fecha o modal de edição
            this.listarAlunos();         // recarrega a tabela com os dados atualizados
            UIHelper.showToast('Sucesso', 'Ficha do aluno atualizada!', 'success'); // mensagem de sucesso
        } catch (error) {
            UIHelper.showToast('Erro', 'Falha ao guardar os dados.', 'danger'); // mensagem de erro
        }
    },

    // alternarStatus: ativa ou desativa a ficha de um aluno via PATCH
    alternarStatus: async function(id, nome, statusAtual) {
        // Define o texto da confirmação baseado no status atual
        const acao = statusAtual ? 'Inativar' : 'Reativar';
        // Abre uma janela de confirmação para o usuário
        if (confirm(`Deseja ${acao} a ficha do aluno "${nome}"?`)) {
            try {
                // Envia um PATCH para /alunos/{id}/status — o servidor inverte o status
                const response = await fetch(`${API_URL}/${id}/status`, { method: 'PATCH' });
                if (!response.ok) throw new Error('Falha'); // se o servidor retornou erro, lança exceção
                this.listarAlunos(); // recarrega a tabela com o novo status
                // Exibe mensagem informando o novo estado do aluno
                UIHelper.showToast('Status Alterado', `O aluno ${nome} agora está ${statusAtual ? 'Inativo' : 'Ativo'}.`, 'warning');
            } catch (error) {
                UIHelper.showToast('Erro', `Não foi possível ${acao}.`, 'danger');
            }
        }
    },

    // renderizarTabela: recebe um array de alunos e monta o HTML de cada linha da tabela
    renderizarTabela: function(alunosArray) {
        this.tbody.innerHTML = ''; // limpa a tabela antes de redesenhar
        // Atualiza o texto com a quantidade de registros exibidos
        this.infoTabela.innerText = `Exibindo ${alunosArray.length} registos`;

        // Se não há alunos, exibe uma mensagem no lugar da tabela
        if (alunosArray.length === 0) {
            this.tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-5">Nenhum aluno encontrado.</td></tr>`;
            return;
        }

        // Percorre cada aluno e cria uma linha HTML para ele
        alunosArray.forEach(aluno => {
            // Badge verde se ativo, vermelho se inativo
            const badgeAtivo = aluno.ativo
                ? `<span class="badge bg-success bg-opacity-10 text-success border border-success">ATIVO</span>`
                : `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger">INATIVO</span>`;

            // Se o aluno tem smartwatch e MAC cadastrado, mostra "Sincronizado"; senão "Sem Smartwatch"
            const badgeHTML = aluno.possuiSmartwatch && aluno.dispositivoMac
                ? `<span class="status-badge status-active"><i class="fa-solid fa-check-circle"></i> Sincronizado</span><br><code class="mac-address mt-1 d-inline-block">${aluno.dispositivoMac}</code>`
                : `<span class="status-badge status-inactive"><i class="fa-solid fa-xmark"></i> Sem Smartwatch</span>`;

            // Nome do plano ou aviso vermelho se não tiver plano
            const nomePlano = aluno.plano && aluno.plano.nomePlano ? aluno.plano.nomePlano : '<span class="text-danger">Sem Plano</span>';
            // Cor do botão de ação: vermelho para inativar, verde para reativar
            const btnAcaoClass = aluno.ativo ? 'btn-outline-danger' : 'btn-outline-success';
            // Ícone do botão de ação: proibido para inativar, check para reativar
            const btnAcaoIcon = aluno.ativo ? 'fa-ban' : 'fa-check';
            // Texto do tooltip do botão
            const btnAcaoTitle = aluno.ativo ? 'Inativar Aluno' : 'Reativar Aluno';
            // Codifica os dados do aluno para passar como parâmetro no onclick
            const dadosStr = encodeURIComponent(JSON.stringify(aluno));
            // Classe CSS para deixar a linha cinza se o aluno estiver inativo
            const trClass = aluno.ativo ? '' : 'opacity-50 bg-body-secondary';
            // Desabilita o botão de editar se o aluno estiver inativo
            const btnEditDesativado = aluno.ativo ? '' : 'disabled';
            // Tooltip diferente para o botão de edição dependendo do status
            const tituloEdit = aluno.ativo ? 'Editar Ficha' : 'Reative o aluno para poder editar';

            // Adiciona a linha HTML do aluno na tabela
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

    // atualizarEstatisticas: atualiza os cards de resumo no topo da página
    atualizarEstatisticas: function(alunos) {
        // Filtra apenas os alunos ativos
        const ativos = alunos.filter(a => a.ativo);
        // Exibe a quantidade de alunos ativos
        this.statTotal.innerText = ativos.length;
        // Exibe quantos alunos ativos têm smartwatch
        this.statSmart.innerText = ativos.filter(a => a.possuiSmartwatch).length;
    },

    // filtrarTabela: filtra os alunos em memória sem precisar chamar o servidor
    filtrarTabela: function(e) {
        const t = e.target.value.toLowerCase(); // texto digitado em minúsculas
        // Filtra os alunos cujo nome ou e-mail contenha o texto digitado
        const filt = alunosMemoria.filter(a => a.nome.toLowerCase().includes(t) || a.email.toLowerCase().includes(t));
        // Redesenha a tabela com apenas os alunos filtrados
        this.renderizarTabela(filt);
    },

    // validarMac: verifica se o endereço MAC digitado está no formato correto
    validarMac: function() {
        // Se o switch de smartwatch não está ativo, não precisa validar — retorna verdadeiro
        if(!document.getElementById('edit-possuiSmartwatch').checked) return true;
        const macVal = document.getElementById('dispositivoMac').value.trim();
        // Regex que valida o formato XX:XX:XX:XX:XX:XX (onde X é 0-9 ou A-F)
        if (/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(macVal)) return true;
        // Se inválido, mostra a mensagem de feedback de erro
        document.getElementById('mac-feedback').style.display = 'block';
        return false;
    },

    // initTheme: lê o tema salvo no navegador e aplica ao carregar a página
    initTheme: function() {
        // Lê o tema guardado no localStorage. Se não tiver, usa 'light' como padrão
        const savedTheme = localStorage.getItem('gymnex_theme') || 'light';
        this.applyTheme(savedTheme);
    },
    // toggleTheme: inverte o tema atual quando o botão de tema é clicado
    toggleTheme: function() {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme'); // lê o tema atual
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'; // inverte
        this.applyTheme(newTheme); // aplica o novo tema
    },
    // applyTheme: aplica o tema no HTML e atualiza o ícone do botão
    applyTheme: function(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme); // define o tema no <html>
        localStorage.setItem('gymnex_theme', theme); // salva a preferência no navegador
        const btn = this.btnThemeToggle;
        const icon = btn.querySelector('i'); // encontra o ícone dentro do botão
        if (theme === 'dark') {
            icon.classList.replace('fa-moon', 'fa-sun');              // troca lua por sol
            btn.classList.replace('btn-dark', 'btn-light');           // troca estilo do botão
            btn.classList.replace('border-secondary', 'border-light');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');              // troca sol por lua
            btn.classList.replace('btn-light', 'btn-dark');           // troca estilo do botão
            btn.classList.replace('border-light', 'border-secondary');
        }
    }
};

// prepararEdicao: preenche o formulário modal com os dados do aluno que será editado
// É chamado pelo botão de editar em cada linha da tabela
window.prepararEdicao = function(alunoCodificado) {
    // Decodifica a string URI e converte o JSON de volta para objeto JavaScript
    const aluno = JSON.parse(decodeURIComponent(alunoCodificado));
    const form = document.getElementById('aluno-form');
    form.classList.remove('was-validated'); // remove mensagens de validação anteriores

    // Preenche cada campo do formulário com os dados do aluno
    document.getElementById('aluno-id').value = aluno.id;               // ID oculto para saber qual aluno editar
    // Guarda o status atual do aluno no campo oculto (true ou false como texto)
    document.getElementById('aluno-ativo').value = aluno.ativo === true ? 'true' : 'false';
    document.getElementById('nome').value = aluno.nome;
    document.getElementById('email').value = aluno.email;
    document.getElementById('telefone').value = aluno.telefone;
    document.getElementById('dataNascimento').value = aluno.dataNascimento;
    document.getElementById('cidade').value = aluno.cidade;
    document.getElementById('condicaoMedica').value = aluno.condicaoMedica || ''; // se null, usa string vazia

    // Define o plano selecionado no dropdown. Se não tiver plano, deixa em branco.
    if(aluno.plano && aluno.plano.id) {
        document.getElementById('edit-planoSelecionado').value = aluno.plano.id;
    } else {
        document.getElementById('edit-planoSelecionado').value = '';
    }

    // Referências ao switch de smartwatch e ao campo de MAC
    const checkSmart = document.getElementById('edit-possuiSmartwatch');
    const containerMac = document.getElementById('edit-container-mac');
    const inputMac = document.getElementById('dispositivoMac');

    // Marca ou desmarca o switch conforme o valor do aluno
    checkSmart.checked = aluno.possuiSmartwatch;
    if(aluno.possuiSmartwatch) {
        // Se tem smartwatch, mostra o campo MAC e preenche com o valor existente
        containerMac.classList.remove('d-none');
        inputMac.required = true;
        inputMac.value = aluno.dispositivoMac || '';
    } else {
        // Se não tem smartwatch, esconde o campo MAC e limpa
        containerMac.classList.add('d-none');
        inputMac.required = false;
        inputMac.value = '';
    }

    // Abre o modal de edição para o usuário fazer as alterações
    AppController.modalCadastro.show();
};

// UIHelper: classe auxiliar responsável por exibir mensagens de feedback (toasts) na tela
class UIHelper {
    // showToast: cria e exibe uma notificação temporária no canto da tela
    static showToast(title, message, type = 'info') {
        const container = document.getElementById('toast-container'); // container onde os toasts são inseridos
        const id = 'toast-' + Date.now(); // ID único usando o timestamp atual para evitar conflitos
        // Define o ícone e a cor com base no tipo de mensagem
        let icon = type === 'success' ? 'fa-check-circle text-success' : type === 'danger' ? 'fa-circle-xmark text-danger' : 'fa-circle-info text-warning';
        // Monta o HTML do toast com título, ícone e mensagem
        const html = `
            <div id="${id}" class="toast border-0 shadow-sm" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header border-bottom-0"><i class="fa-solid ${icon} me-2 fs-5"></i><strong class="me-auto text-body-emphasis">${title}</strong><button type="button" class="btn-close" data-bs-dismiss="toast"></button></div>
                <div class="toast-body bg-body-tertiary rounded-bottom text-body">${message}</div>
            </div>`;
        // Insere o toast no final do container
        container.insertAdjacentHTML('beforeend', html);
        // Cria e exibe o toast usando o Bootstrap, com 4 segundos de duração
        const bsToast = new bootstrap.Toast(document.getElementById(id), { delay: 4000 });
        bsToast.show();
        // Quando o toast fechar sozinho, remove o elemento do HTML para não acumular lixo
        document.getElementById(id).addEventListener('hidden.bs.toast', () => document.getElementById(id).remove());
    }
}