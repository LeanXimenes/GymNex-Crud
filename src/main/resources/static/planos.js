/**
 * GymNex - Lógica de Gerenciamento de Planos
 */

'use strict';

const API_PLANOS = '/planos';

document.addEventListener('DOMContentLoaded', () => {
    PlanosController.init();
});

const PlanosController = {

    init: function() {
        this.cacheDOM();
        this.bindEvents();
        this.initTheme();
        this.listarPlanos();
    },

    cacheDOM: function() {
        this.form = document.getElementById('plano-form');
        this.tbody = document.getElementById('tabela-planos');
        this.modalCadastro = new bootstrap.Modal(document.getElementById('modalCadastroPlano'));
        this.btnThemeToggle = document.getElementById('btn-theme-toggle');
        this.statTotal = document.getElementById('stat-total-planos');
        this.statMedia = document.getElementById('stat-media-preco');
    },

    bindEvents: function() {
        this.form.addEventListener('submit', this.salvarPlano.bind(this));
        this.btnThemeToggle.addEventListener('click', this.toggleTheme.bind(this));
    },

    // Formata o número (ex: 99.90) para o padrão de moeda brasileiro (R$ 99,90)
    formatarMoeda: function(valor) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    },

    // READ
    listarPlanos: async function() {
        this.tbody.innerHTML = `<tr><td colspan="5" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>`;

        try {
            const response = await fetch(API_PLANOS);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const planos = await response.json();
            this.renderizarTabela(planos);
            this.atualizarEstatisticas(planos);

        } catch (error) {
            console.error('Erro:', error);
            this.tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4 fw-bold">Falha ao comunicar com o servidor.</td></tr>`;
            UIHelperPlano.showToast('Erro de Conexão', 'Não foi possível carregar os planos.', 'danger');
        }
    },

    // CREATE / UPDATE
    salvarPlano: async function(event) {
        event.preventDefault();

        if (!this.form.checkValidity()) {
            event.stopPropagation();
            this.form.classList.add('was-validated');
            return;
        }

        const id = document.getElementById('plano-id').value;
        const dadosPlano = {
            nomePlano: document.getElementById('nomePlano').value.trim(),
            preco: parseFloat(document.getElementById('preco').value),
            duracaoMeses: parseInt(document.getElementById('duracaoMeses').value)
        };

        const config = {
            url: id ? `${API_PLANOS}/${id}` : API_PLANOS,
            method: id ? 'PUT' : 'POST'
        };

        try {
            const response = await fetch(config.url, {
                method: config.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosPlano)
            });

            if (!response.ok) throw new Error('Falha na requisição');

            this.modalCadastro.hide();
            this.listarPlanos();
            UIHelperPlano.showToast('Sucesso', id ? 'Plano atualizado!' : 'Plano cadastrado!', 'success');

        } catch (error) {
            console.error('Erro:', error);
            UIHelperPlano.showToast('Erro Crítico', 'Falha ao salvar o plano.', 'danger');
        }
    },

    // DELETE
    deletarPlano: async function(id, nome) {
        if (confirm(`Atenção: Tem certeza que deseja deletar o plano "${nome}"?`)) {
            try {
                const response = await fetch(`${API_PLANOS}/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Falha ao deletar');

                this.listarPlanos();
                UIHelperPlano.showToast('Excluído', `O plano ${nome} foi removido.`, 'warning');
            } catch (error) {
                console.error('Erro:', error);
                UIHelperPlano.showToast('Erro', 'Não foi possível remover o plano.', 'danger');
            }
        }
    },

    renderizarTabela: function(planos) {
        this.tbody.innerHTML = '';
        if (planos.length === 0) {
            this.tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-5">Nenhum plano cadastrado.</td></tr>`;
            return;
        }

        planos.forEach(plano => {
            this.tbody.innerHTML += `
                <tr>
                    <td class="text-muted fw-bold ps-4">#${plano.id}</td>
                    <td class="fw-bold text-body-emphasis"><i class="fa-solid fa-crown text-warning me-2"></i>${plano.nomePlano}</td>
                    <td><span class="badge bg-secondary">${plano.duracaoMeses} Meses</span></td>
                    <td class="fw-bold text-success">${this.formatarMoeda(plano.preco)}</td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-primary shadow-sm me-2" onclick="prepararEdicaoPlano(${plano.id}, '${plano.nomePlano}', ${plano.preco}, ${plano.duracaoMeses})">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger shadow-sm" onclick="PlanosController.deletarPlano(${plano.id}, '${plano.nomePlano}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    },

    atualizarEstatisticas: function(planos) {
        this.statTotal.innerText = planos.length;

        let soma = 0;
        planos.forEach(p => soma += p.preco);
        const media = planos.length > 0 ? soma / planos.length : 0;

        this.statMedia.innerText = this.formatarMoeda(media);
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
        const icon = this.btnThemeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.replace('fa-moon', 'fa-sun');
            this.btnThemeToggle.classList.replace('btn-outline-secondary', 'btn-outline-light');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            this.btnThemeToggle.classList.replace('btn-outline-light', 'btn-outline-secondary');
        }
    }
};

window.prepararEdicaoPlano = function(id, nome, preco, duracao) {
    const form = document.getElementById('plano-form');
    form.classList.remove('was-validated');

    document.getElementById('form-title-plano').innerText = 'Editar Plano';
    document.getElementById('plano-id').value = id;
    document.getElementById('nomePlano').value = nome;
    document.getElementById('preco').value = preco;
    document.getElementById('duracaoMeses').value = duracao;
    document.getElementById('btn-submit-plano').innerHTML = '<i class="fa-solid fa-rotate me-2"></i> Atualizar Plano';

    PlanosController.modalCadastro.show();
};

window.limparFormularioPlano = function() {
    const form = document.getElementById('plano-form');
    form.reset();
    form.classList.remove('was-validated');

    document.getElementById('form-title-plano').innerText = 'Cadastrar Novo Plano';
    document.getElementById('plano-id').value = '';
    document.getElementById('btn-submit-plano').innerHTML = '<i class="fa-solid fa-floppy-disk me-2"></i> Salvar Plano';
};

class UIHelperPlano {
    static showToast(title, message, type = 'info') {
        const container = document.getElementById('toast-container');
        const id = 'toast-plano-' + Date.now();
        let icon = 'fa-circle-info';
        let headerColor = 'text-primary';

        if (type === 'success') { icon = 'fa-check-circle'; headerColor = 'text-success'; }
        else if (type === 'danger') { icon = 'fa-circle-xmark'; headerColor = 'text-danger'; }
        else if (type === 'warning') { icon = 'fa-triangle-exclamation'; headerColor = 'text-warning'; }

        const toastHTML = `
            <div id="${id}" class="toast border-0 shadow-sm" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header border-bottom-0">
                    <i class="fa-solid ${icon} ${headerColor} me-2 fs-5"></i>
                    <strong class="me-auto text-body-emphasis">${title}</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body bg-body-tertiary rounded-bottom text-body">${message}</div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', toastHTML);
        const toastElement = document.getElementById(id);
        const bsToast = new bootstrap.Toast(toastElement, { delay: 4000 });
        bsToast.show();
        toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
    }
}