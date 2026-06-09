'use strict';

const API_INSTRUTOR = '/instrutores/1';
let instrutorAtual = {};

document.addEventListener('DOMContentLoaded', () => {
    ConfigController.init();
});

const ConfigController = {
    init: function() {
        this.cacheDOM();
        this.bindEvents();
        this.initTheme();
        this.carregarDados();
    },

    cacheDOM: function() {
        this.form = document.getElementById('form-config');
        this.btnThemeToggle = document.getElementById('btn-theme-toggle');
    },

    bindEvents: function() {
        this.form.addEventListener('submit', this.salvarDados.bind(this));
        this.btnThemeToggle.addEventListener('click', this.toggleTheme.bind(this));
    },

    carregarDados: async function() {
        try {
            const res = await fetch(API_INSTRUTOR);
            if (!res.ok) throw new Error();
            instrutorAtual = await res.json();

            document.getElementById('notificacoesEmail').checked = instrutorAtual.notificacoesEmail || false;
            document.getElementById('notificacoesSms').checked = instrutorAtual.notificacoesSms || false;
            document.getElementById('temaEscuro').checked = instrutorAtual.temaEscuro || false;

            this.atualizarSidebar(instrutorAtual);
        } catch (error) {
            UIHelperConfig.showToast('Erro', 'Falha ao carregar configurações.', 'danger');
        }
    },

    salvarDados: async function(event) {
        event.preventDefault();

        const dadosSalvar = {
            ...instrutorAtual,
            notificacoesEmail: document.getElementById('notificacoesEmail').checked,
            notificacoesSms: document.getElementById('notificacoesSms').checked,
            temaEscuro: document.getElementById('temaEscuro').checked
        };

        try {
            const res = await fetch(API_INSTRUTOR, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosSalvar)
            });

            if (!res.ok) throw new Error();

            instrutorAtual = await res.json();

            // Reflete a alteração de tema imediatamente na interface e no localStorage
            const novoTema = instrutorAtual.temaEscuro ? 'dark' : 'light';
            this.applyTheme(novoTema);

            UIHelperConfig.showToast('Sucesso', 'Configurações atualizadas.', 'success');
        } catch (error) {
            UIHelperConfig.showToast('Erro', 'Não foi possível salvar as configurações.', 'danger');
        }
    },

    atualizarSidebar: function(instrutor) {
        const fotoEl = document.getElementById('sidebar-instrutor-foto');
        const nomeEl = document.getElementById('sidebar-instrutor-nome');
        if(fotoEl) fotoEl.src = instrutor.fotoPerfilUrl || 'https://ui-avatars.com/api/?name=Instrutor&background=0d6efd&color=fff';
        if(nomeEl) nomeEl.innerText = instrutor.nome || 'Instrutor';
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

class UIHelperConfig {
    static showToast(title, message, type = 'info') {
        const container = document.getElementById('toast-container');
        const id = 'toast-' + Date.now();
        let icon = type === 'success' ? 'fa-check-circle text-success' : 'fa-circle-xmark text-danger';
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