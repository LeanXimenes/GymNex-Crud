'use strict';

const API_URL = '/alunos';
const API_PLANOS = '/planos';
let alunosMemoria = [];

document.addEventListener('DOMContentLoaded', () => {
    AppController.init();
});

const AppController = {

    init: function() {
        this.cacheDOM();
        this.bindEvents();
        this.initTheme();
        this.listarAlunos();
        this.carregarPlanosParaEdicao();
    },

    cacheDOM: function() {
        this.form = document.getElementById('aluno-form');
        this.tbody = document.getElementById('tabela-alunos');
        this.inputBusca = document.getElementById('pesquisa-aluno');
        this.modalCadastro = new bootstrap.Modal(document.getElementById('modalCadastroAluno'));
        this.btnThemeToggle = document.getElementById('btn-theme-toggle');
        this.statTotal = document.getElementById('stat-total-alunos');
        this.statSmart = document.getElementById('stat-smartwatches');
        this.infoTabela = document.getElementById('tabela-info');
    },

    bindEvents: function() {
        this.form.addEventListener('submit', this.salvarAluno.bind(this));
        this.inputBusca.addEventListener('input', this.filtrarTabela.bind(this));

        document.getElementById('edit-possuiSmartwatch').addEventListener('change', (e) => {
            const containerMac = document.getElementById('edit-container-mac');
            const macInput = document.getElementById('dispositivoMac');
            if(e.target.checked) {
                containerMac.classList.remove('d-none');
                macInput.required = true;
            } else {
                containerMac.classList.add('d-none');
                macInput.required = false;
                macInput.value = '';
            }
        });

        const macInput = document.getElementById('dispositivoMac');
        macInput.addEventListener('input', function(e) {
            let val = e.target.value.replace(/[^A-Fa-f0-9]/g, '').toUpperCase();
            if (val.length > 0) val = val.match(/.{1,2}/g).join(':');
            e.target.value = val.substring(0, 17);
        });

        // REGEX DE VALIDAÇÃO: Telefone e Cidade do Modal de Edição
        const telefoneInput = document.getElementById('telefone');
        if(telefoneInput) {
            telefoneInput.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); });
        }
        const cidadeInput = document.getElementById('cidade');
        if(cidadeInput) {
            cidadeInput.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''); });
        }

        this.btnThemeToggle.addEventListener('click', this.toggleTheme.bind(this));
    },

    carregarPlanosParaEdicao: async function() {
        try {
            const response = await fetch(API_PLANOS);
            const planos = await response.json();
            const select = document.getElementById('edit-planoSelecionado');
            select.innerHTML = '<option value="" disabled>Escolha um plano...</option>';
            planos.forEach(p => { select.innerHTML += `<option value="${p.id}">${p.nomePlano}</option>`; });
        } catch (error) { console.error('Erro ao carregar planos:', error); }
    },

    // UX Limpa: Sem spinners bloqueantes. Ocorre em background.
    listarAlunos: async function() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error();
            const alunos = await response.json();
            alunosMemoria = alunos;
            this.renderizarTabela(alunos);
            this.atualizarEstatisticas(alunos);
        } catch (error) {
            // Em caso de erro, avisa discretamente
            this.tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4 fw-bold">Não foi possível carregar os dados.</td></tr>`;
        }
    },

    salvarAluno: async function(event) {
        event.preventDefault();
        if (!this.form.checkValidity() || !this.validarMac()) {
            event.stopPropagation();
            this.form.classList.add('was-validated');
            return;
        }

        const id = document.getElementById('aluno-id').value;
        const possuiMac = document.getElementById('edit-possuiSmartwatch').checked;
        const dadosAluno = {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            dataNascimento: document.getElementById('dataNascimento').value,
            cidade: document.getElementById('cidade').value.trim(),
            condicaoMedica: document.getElementById('condicaoMedica').value.trim(),
            possuiSmartwatch: possuiMac,
            dispositivoMac: possuiMac ? document.getElementById('dispositivoMac').value.trim() : null,
            plano: { id: document.getElementById('edit-planoSelecionado').value }
        };

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosAluno)
            });
            if (!response.ok) throw new Error('Erro');
            this.modalCadastro.hide();
            this.listarAlunos();
            UIHelper.showToast('Sucesso', 'Dados atualizados!', 'success');
        } catch (error) { UIHelper.showToast('Erro', 'Falha ao guardar dados.', 'danger'); }
    },

    alternarStatus: async function(id, nome, statusAtual) {
        const acao = statusAtual ? 'Inativar' : 'Reativar';
        if (confirm(`Deseja ${acao} a ficha do aluno "${nome}"?`)) {
            try {
                const response = await fetch(`${API_URL}/${id}/status`, { method: 'PATCH' });
                if (!response.ok) throw new Error('Falha');
                this.listarAlunos();
                UIHelper.showToast('Status Alterado', `O aluno ${nome} agora está ${statusAtual ? 'Inativo' : 'Ativo'}.`, 'warning');
            } catch (error) { UIHelper.showToast('Erro', `Não foi possível ${acao}.`, 'danger'); }
        }
    },

    renderizarTabela: function(alunosArray) {
        this.tbody.innerHTML = '';
        this.infoTabela.innerText = `Exibindo ${alunosArray.length} registos`;

        if (alunosArray.length === 0) {
            this.tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-5">Nenhum aluno encontrado.</td></tr>`;
            return;
        }

        alunosArray.forEach(aluno => {
            const badgeAtivo = aluno.ativo
                ? `<span class="badge bg-success bg-opacity-10 text-success border border-success">ATIVO</span>`
                : `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger">INATIVO</span>`;

            const badgeHTML = aluno.possuiSmartwatch && aluno.dispositivoMac
                ? `<span class="status-badge status-active"><i class="fa-solid fa-check-circle"></i> Sincronizado</span><br><code class="mac-address mt-1 d-inline-block">${aluno.dispositivoMac}</code>`
                : `<span class="status-badge status-inactive"><i class="fa-solid fa-xmark"></i> Sem Smartwatch</span>`;

            const nomePlano = aluno.plano ? aluno.plano.nomePlano : '<span class="text-danger">Sem Plano</span>';
            const btnAcaoClass = aluno.ativo ? 'btn-outline-danger' : 'btn-outline-success';
            const btnAcaoIcon = aluno.ativo ? 'fa-ban' : 'fa-check';
            const btnAcaoTitle = aluno.ativo ? 'Inativar Aluno' : 'Reativar Aluno';
            const dadosStr = encodeURIComponent(JSON.stringify(aluno));
            const trClass = aluno.ativo ? '' : 'opacity-50 bg-body-secondary';

            this.tbody.innerHTML += `
                <tr class="${trClass}">
                    <td class="text-muted fw-bold ps-4">#${aluno.id}</td>
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
                        <button class="btn btn-sm btn-outline-primary shadow-sm me-1" title="Editar Ficha" onclick="prepararEdicao('${dadosStr}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-sm ${btnAcaoClass} shadow-sm" title="${btnAcaoTitle}" onclick="AppController.alternarStatus(${aluno.id}, '${aluno.nome}', ${aluno.ativo})"><i class="fa-solid ${btnAcaoIcon}"></i></button>
                    </td>
                </tr>
            `;
        });
    },

    atualizarEstatisticas: function(alunos) {
        const ativos = alunos.filter(a => a.ativo);
        this.statTotal.innerText = ativos.length;
        this.statSmart.innerText = ativos.filter(a => a.possuiSmartwatch).length;
    },

    filtrarTabela: function(e) {
        const t = e.target.value.toLowerCase();
        const filt = alunosMemoria.filter(a => a.nome.toLowerCase().includes(t) || a.email.toLowerCase().includes(t));
        this.renderizarTabela(filt);
    },

    validarMac: function() {
        if(!document.getElementById('edit-possuiSmartwatch').checked) return true;
        const macVal = document.getElementById('dispositivoMac').value.trim();
        if (/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(macVal)) return true;
        document.getElementById('mac-feedback').style.display = 'block';
        return false;
    },

    initTheme: function() { const t = localStorage.getItem('gymnex_theme') || 'light'; this.applyTheme(t); },
    toggleTheme: function() { const t = document.documentElement.getAttribute('data-bs-theme') === 'light' ? 'dark' : 'light'; this.applyTheme(t); },
    applyTheme: function(t) { document.documentElement.setAttribute('data-bs-theme', t); localStorage.setItem('gymnex_theme', t); const i = this.btnThemeToggle.querySelector('i'); if (t === 'dark') { i.classList.replace('fa-moon', 'fa-sun'); this.btnThemeToggle.classList.replace('btn-outline-secondary', 'btn-outline-light'); } else { i.classList.replace('fa-sun', 'fa-moon'); this.btnThemeToggle.classList.replace('btn-outline-light', 'btn-outline-secondary'); } }
};

window.prepararEdicao = function(alunoCodificado) {
    const aluno = JSON.parse(decodeURIComponent(alunoCodificado));
    const form = document.getElementById('aluno-form');
    form.classList.remove('was-validated');

    document.getElementById('aluno-id').value = aluno.id;
    document.getElementById('nome').value = aluno.nome;
    document.getElementById('email').value = aluno.email;
    document.getElementById('telefone').value = aluno.telefone;
    document.getElementById('dataNascimento').value = aluno.dataNascimento;
    document.getElementById('cidade').value = aluno.cidade;
    document.getElementById('condicaoMedica').value = aluno.condicaoMedica || '';

    if(aluno.plano) { document.getElementById('edit-planoSelecionado').value = aluno.plano.id; }

    const checkSmart = document.getElementById('edit-possuiSmartwatch');
    const containerMac = document.getElementById('edit-container-mac');
    const inputMac = document.getElementById('dispositivoMac');

    checkSmart.checked = aluno.possuiSmartwatch;
    if(aluno.possuiSmartwatch) {
        containerMac.classList.remove('d-none');
        inputMac.required = true;
        inputMac.value = aluno.dispositivoMac || '';
    } else {
        containerMac.classList.add('d-none');
        inputMac.required = false;
        inputMac.value = '';
    }

    AppController.modalCadastro.show();
};

class UIHelper {
    static showToast(title, message, type = 'info') {
        const container = document.getElementById('toast-container');
        const id = 'toast-' + Date.now();
        let icon = type === 'success' ? 'fa-check-circle text-success' : type === 'danger' ? 'fa-circle-xmark text-danger' : 'fa-circle-info text-warning';
        const html = `
            <div id="${id}" class="toast border-0 shadow-sm" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header border-bottom-0"><i class="fa-solid ${icon} me-2 fs-5"></i><strong class="me-auto text-body-emphasis">${title}</strong><button type="button" class="btn-close" data-bs-dismiss="toast"></button></div>
                <div class="toast-body bg-body-tertiary rounded-bottom text-body">${message}</div>
            </div>`;
        container.insertAdjacentHTML('beforeend', html);
        const bsToast = new bootstrap.Toast(document.getElementById(id), { delay: 4000 });
        bsToast.show();
        document.getElementById(id).addEventListener('hidden.bs.toast', () => document.getElementById(id).remove());
    }
}