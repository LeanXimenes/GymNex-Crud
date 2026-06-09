'use strict';

const API_INSTRUTOR = '/instrutores/1';
let instrutorAtual = {};

document.addEventListener('DOMContentLoaded', () => {
    PerfilController.init();
});

const PerfilController = {
    init: function() {
        this.cacheDOM();
        this.bindEvents();
        this.initTheme();
        this.carregarDados();
        this.arquivoFotoLocal = null;
    },

    cacheDOM: function() {
        this.form = document.getElementById('form-perfil');
        this.btnThemeToggle = document.getElementById('btn-theme-toggle');
        this.previewFoto = document.getElementById('preview-foto');
        this.fotoInput = document.getElementById('fotoPerfilFile');
        this.btnSubmit = this.form.querySelector('button[type="submit"]');
    },

    bindEvents: function() {
        this.form.addEventListener('submit', this.salvarDados.bind(this));
        this.btnThemeToggle.addEventListener('click', this.toggleTheme.bind(this));

        if (this.fotoInput) {
            this.fotoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.arquivoFotoLocal = file;
                    console.log('Arquivo armazenado para upload local:', this.arquivoFotoLocal);

                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.previewFoto.src = event.target.result;
                        instrutorAtual.fotoPerfilUrl = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    },

    carregarDados: async function() {
        try {
            const res = await fetch(API_INSTRUTOR);
            if (!res.ok) throw new Error();
            instrutorAtual = await res.json();

            document.getElementById('nome').value = instrutorAtual.nome || '';
            document.getElementById('email').value = instrutorAtual.email || '';
            document.getElementById('telefone').value = instrutorAtual.telefone || '';
            document.getElementById('especialidades').value = instrutorAtual.especialidades || '';

            this.previewFoto.src = instrutorAtual.fotoPerfilUrl || 'https://ui-avatars.com/api/?name=Instrutor&background=0d6efd&color=fff';

            this.atualizarSidebar(instrutorAtual);
        } catch (error) {
            UIHelperPerfil.showToast('Erro', 'Falha ao carregar perfil do instrutor.', 'danger');
        }
    },

    salvarDados: async function(event) {
        event.preventDefault();

        if (!this.form.checkValidity()) {
            event.stopPropagation();
            this.form.classList.add('was-validated');
            return;
        }

        // Estado de "Carregando" na Interface
        const btnOriginalText = this.btnSubmit.innerHTML;
        this.btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Salvando...';
        this.btnSubmit.disabled = true;

        const dadosSalvar = {
            ...instrutorAtual,
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            especialidades: document.getElementById('especialidades').value.trim()
        };

        try {
            const res = await fetch(API_INSTRUTOR, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosSalvar)
            });

            if (!res.ok) {
                const erroServidor = await res.text();
                console.error("Erro retornado pelo backend:", erroServidor);
                throw new Error("Rejeitado pelo servidor.");
            }

            instrutorAtual = await res.json();
            this.atualizarSidebar(instrutorAtual);
            UIHelperPerfil.showToast('Sucesso', 'Perfil atualizado com sucesso!', 'success');

            this.fotoInput.value = '';
            this.arquivoFotoLocal = null;

        } catch (error) {
            console.error('Erro na requisição de salvar:', error);
            UIHelperPerfil.showToast('Erro', 'Não foi possível salvar os dados. O servidor pode ter recusado o arquivo.', 'danger');
        } finally {
            this.btnSubmit.innerHTML = btnOriginalText;
            this.btnSubmit.disabled = false;
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

class UIHelperPerfil {
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