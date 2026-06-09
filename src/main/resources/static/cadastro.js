'use strict';

const API_ALUNOS = '/alunos';
const API_PLANOS = '/planos';

document.addEventListener('DOMContentLoaded', () => {
    CadastroController.init();
});

const CadastroController = {

    init: function() {
        this.form = document.getElementById('form-cadastro-aluno');
        this.btnThemeToggle = document.getElementById('btn-theme-toggle');
        this.selectPlano = document.getElementById('planoSelecionado');
        this.checkboxSmartwatch = document.getElementById('possuiSmartwatch');
        this.containerMac = document.getElementById('container-mac');

        this.bindEvents();
        this.carregarInstrutorSidebar();
        this.initTheme();
        this.carregarPlanos();
    },

    bindEvents: function() {
        this.form.addEventListener('submit', this.realizarMatricula.bind(this));
        this.btnThemeToggle.addEventListener('click', this.toggleTheme.bind(this));

        this.checkboxSmartwatch.addEventListener('change', (e) => {
            if(e.target.checked) {
                this.containerMac.classList.remove('d-none');
                document.getElementById('dispositivoMac').required = true;
            } else {
                this.containerMac.classList.add('d-none');
                document.getElementById('dispositivoMac').required = false;
                document.getElementById('dispositivoMac').value = '';
            }
        });

        const macInput = document.getElementById('dispositivoMac');
        macInput.addEventListener('input', function(e) {
            let val = e.target.value.replace(/[^A-Fa-f0-9]/g, '').toUpperCase();
            if (val.length > 0) val = val.match(/.{1,2}/g).join(':');
            e.target.value = val.substring(0, 17);
        });

        const telefoneInput = document.getElementById('telefone');
        if(telefoneInput) {
            telefoneInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }

        const cidadeInput = document.getElementById('cidade');
        if(cidadeInput) {
            cidadeInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
            });
        }
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

    carregarPlanos: async function() {
        try {
            const response = await fetch(API_PLANOS);
            const planos = await response.json();

            this.selectPlano.innerHTML = '<option value="" disabled selected>Escolha um plano...</option>';

            if(planos.length === 0) {
                this.selectPlano.innerHTML = '<option value="" disabled selected>⚠️ Nenhum plano cadastrado. Vá à aba de Planos primeiro.</option>';
                return;
            }

            planos.forEach(p => {
                const precoBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.preco);
                this.selectPlano.innerHTML += `<option value="${p.id}">${p.nomePlano} - ${precoBRL} (${p.duracaoMeses} meses)</option>`;
            });
        } catch (error) {
            console.error('Erro ao carregar planos:', error);
            this.selectPlano.innerHTML = '<option value="" disabled selected>Erro ao buscar planos.</option>';
        }
    },

    realizarMatricula: async function(event) {
        event.preventDefault();

        if (!this.form.checkValidity() || !this.validarMac()) {
            event.stopPropagation();
            this.form.classList.add('was-validated');
            return;
        }

        const btnSubmit = document.getElementById('btn-submit');
        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> A processar...';
        btnSubmit.disabled = true;

        const novoAluno = {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            dataNascimento: document.getElementById('dataNascimento').value,
            cidade: document.getElementById('cidade').value.trim(),
            condicaoMedica: document.getElementById('condicaoMedica').value.trim(),
            possuiSmartwatch: this.checkboxSmartwatch.checked,
            dispositivoMac: this.checkboxSmartwatch.checked ? document.getElementById('dispositivoMac').value.trim() : null,
            plano: { id: document.getElementById('planoSelecionado').value }
        };

        try {
            const response = await fetch(API_ALUNOS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoAluno)
            });

            if (!response.ok) throw new Error('Falha no registo');

            UIHelperCadastro.showToast('Registo Concluído!', `O aluno ${novoAluno.nome} foi matriculado. A redirecionar...`, 'success');
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);

        } catch (error) {
            console.error('Erro:', error);
            UIHelperCadastro.showToast('Erro no Registo', 'Não foi possível matricular o aluno.', 'danger');
            btnSubmit.innerHTML = '<i class="fa-solid fa-check-circle me-2"></i> Concluir Inscrição';
            btnSubmit.disabled = false;
        }
    },

    validarMac: function() {
        if (!this.checkboxSmartwatch.checked) return true;
        const macVal = document.getElementById('dispositivoMac').value.trim();
        const feedback = document.getElementById('mac-feedback');
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

        if (!macRegex.test(macVal)) {
            feedback.style.display = 'block';
            return false;
        } else {
            feedback.style.display = 'none';
            return true;
        }
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

class UIHelperCadastro {
    static showToast(title, message, type = 'info') {
        const container = document.getElementById('toast-container');
        const id = 'toast-cad-' + Date.now();
        let icon = type === 'success' ? 'fa-check-circle text-success' : 'fa-circle-xmark text-danger';
        const toastHTML = `
            <div id="${id}" class="toast border-0 shadow-sm" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header border-bottom-0">
                    <i class="fa-solid ${icon} me-2 fs-5"></i>
                    <strong class="me-auto text-body-emphasis">${title}</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body bg-body-tertiary rounded-bottom text-body">${message}</div>
            </div>`;
        container.insertAdjacentHTML('beforeend', toastHTML);
        const bsToast = new bootstrap.Toast(document.getElementById(id), { delay: 4000 });
        bsToast.show();
        document.getElementById(id).addEventListener('hidden.bs.toast', () => document.getElementById(id).remove());
    }
}