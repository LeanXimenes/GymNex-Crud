'use strict';

const API_SINAIS = '/sinais-vitais';
const API_ALUNOS = '/alunos';

document.addEventListener('DOMContentLoaded', () => {
    SinaisVitaisController.init();
});

const SinaisVitaisController = {
    init: function() {
        this.cacheDOM();
        this.bindEvents();
        this.carregarInstrutorSidebar();
        this.initTheme();
        this.carregarAlunos();
        this.listarSinais();
    },

    cacheDOM: function() {
        this.form = document.getElementById('sinal-form');
        this.tbody = document.getElementById('tabela-sinais');
        this.modalCadastro = new bootstrap.Modal(document.getElementById('modalSinalVital'));
        this.btnThemeToggle = document.getElementById('btn-theme-toggle');
        this.selectAluno = document.getElementById('sinal-aluno');
    },

    bindEvents: function() {
        this.form.addEventListener('submit', this.salvarSinal.bind(this));
        this.btnThemeToggle.addEventListener('click', this.toggleTheme.bind(this));
    },

    carregarInstrutorSidebar: async function() {
        try {
            const res = await fetch('/instrutores/1');
            if (res.ok) {
                const instrutor = await res.json();
                const fotoEl = document.getElementById('sidebar-instrutor-foto');
                const nomeEl = document.getElementById('sidebar-instrutor-nome');
                if(fotoEl) fotoEl.src = instrutor.fotoPerfilUrl || 'https://ui-avatars.com/api/?name=Instrutor&background=0d6efd&color=fff';
                if(nomeEl) nomeEl.innerText = instrutor.nome || 'Instrutor';
            }
        } catch(e) {}
    },

    carregarAlunos: async function() {
        try {
            const response = await fetch(API_ALUNOS);
            const alunos = await response.json();
            this.selectAluno.innerHTML = '<option value="" disabled selected>Escolha um aluno...</option>';
            alunos.forEach(a => {
                this.selectAluno.innerHTML += `<option value="${a.id}">${a.nome}</option>`;
            });
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
        }
    },

    listarSinais: async function() {
        try {
            const response = await fetch(API_SINAIS);
            if (!response.ok) throw new Error();
            const sinais = await response.json();
            this.renderizarTabela(sinais);
        } catch (error) {
            this.tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4 fw-bold">Não foi possível carregar os registros.</td></tr>`;
        }
    },

    salvarSinal: async function(event) {
        event.preventDefault();

        if (!this.form.checkValidity()) {
            event.stopPropagation();
            this.form.classList.add('was-validated');
            return;
        }

        const id = document.getElementById('sinal-id').value;
        const dados = {
            aluno: { id: document.getElementById('sinal-aluno').value },
            batimentosCardiacos: document.getElementById('bpm').value,
            pressaoArterial: document.getElementById('pressao').value,
            saturacaoOxigenio: document.getElementById('spo2').value,
            observacoes: document.getElementById('observacoes').value
        };

        const config = {
            url: id ? `${API_SINAIS}/${id}` : API_SINAIS,
            method: id ? 'PUT' : 'POST'
        };

        try {
            const response = await fetch(config.url, {
                method: config.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            if (!response.ok) throw new Error();
            this.modalCadastro.hide();
            this.listarSinais();
            UIHelperSinal.showToast('Sucesso', 'Registro de sinais vitais salvo.', 'success');
        } catch (error) {
            UIHelperSinal.showToast('Erro', 'Falha ao salvar registro.', 'danger');
        }
    },

    deletarSinal: async function(id) {
        if (confirm(`Remover este registro permanentemente?`)) {
            try {
                const response = await fetch(`${API_SINAIS}/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error();
                this.listarSinais();
                UIHelperSinal.showToast('Excluído', `Registro apagado.`, 'warning');
            } catch (error) {
                UIHelperSinal.showToast('Erro', 'Não foi possível remover.', 'danger');
            }
        }
    },

    renderizarTabela: function(sinais) {
        this.tbody.innerHTML = '';
        if (sinais.length === 0) {
            this.tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-5">Nenhum registro encontrado.</td></tr>`;
            return;
        }

        sinais.forEach(sinal => {
            const dataStr = new Date(sinal.dataHoraRegistro).toLocaleString('pt-BR');
            const dadosStr = encodeURIComponent(JSON.stringify(sinal));

            this.tbody.innerHTML += `
                <tr>
                    <td class="ps-4 small text-muted">${dataStr}</td>
                    <td class="fw-bold">${sinal.aluno.nome}</td>
                    <td><span class="badge bg-danger">${sinal.batimentosCardiacos} BPM</span></td>
                    <td class="fw-bold">${sinal.pressaoArterial}</td>
                    <td class="fw-bold text-info">${sinal.saturacaoOxigenio}%</td>
                    <td class="text-muted small">${sinal.observacoes || '--'}</td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-primary shadow-sm me-1" onclick="prepararEdicaoSinal('${dadosStr}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-sm btn-outline-danger shadow-sm" onclick="SinaisVitaisController.deletarSinal(${sinal.id})"><i class="fa-solid fa-trash-can"></i></button>
                    </td>
                </tr>
            `;
        });
    },

    initTheme: function() {
        const savedTheme = localStorage.getItem('gymnex_theme') || 'light';
        this.applyTheme(savedTheme);
    },
    toggleTheme: function() {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    },
    applyTheme: function(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('gymnex_theme', theme);
        const btn = this.btnThemeToggle;
        const icon = btn.querySelector('i');
        if (theme === 'dark') {
            icon.classList.replace('fa-moon', 'fa-sun');
            btn.classList.replace('btn-dark', 'btn-light');
            btn.classList.replace('border-secondary', 'border-light');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            btn.classList.replace('btn-light', 'btn-dark');
            btn.classList.replace('border-light', 'border-secondary');
        }
    }
};

window.prepararEdicaoSinal = function(sinalCodificado) {
    const sinal = JSON.parse(decodeURIComponent(sinalCodificado));
    const form = document.getElementById('sinal-form');
    form.classList.remove('was-validated');

    document.getElementById('form-title-sinal').innerText = 'Editar Registro';
    document.getElementById('sinal-id').value = sinal.id;
    document.getElementById('sinal-aluno').value = sinal.aluno.id;
    document.getElementById('bpm').value = sinal.batimentosCardiacos;
    document.getElementById('pressao').value = sinal.pressaoArterial;
    document.getElementById('spo2').value = sinal.saturacaoOxigenio;
    document.getElementById('observacoes').value = sinal.observacoes || '';

    document.getElementById('btn-submit-sinal').innerHTML = '<i class="fa-solid fa-rotate me-2"></i> Atualizar Registro';
    SinaisVitaisController.modalCadastro.show();
};

window.limparFormularioSinais = function() {
    const form = document.getElementById('sinal-form');
    form.reset();
    form.classList.remove('was-validated');
    document.getElementById('form-title-sinal').innerText = 'Adicionar Registro';
    document.getElementById('sinal-id').value = '';
    document.getElementById('btn-submit-sinal').innerHTML = '<i class="fa-solid fa-floppy-disk me-2"></i> Salvar Registro';
};

class UIHelperSinal {
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