'use strict';

const API_URL = '/alunos';
const API_PLANOS = '/planos';

document.addEventListener('DOMContentLoaded', () => {
    CadastroController.init();
});

const CadastroController = {
    init: function() {
        this.cacheDOM();
        this.bindEvents();
        this.carregarPlanos();
        this.initTheme();
    },

    cacheDOM: function() {
        this.form = document.getElementById('form-cadastro-aluno');
        this.btnThemeToggle = document.getElementById('btn-theme-toggle');
    },

    bindEvents: function() {
        this.form.addEventListener('submit', this.salvarAluno.bind(this));

        document.getElementById('possuiSmartwatch').addEventListener('change', (e) => {
            const containerMac = document.getElementById('container-mac');
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

        this.btnThemeToggle.addEventListener('click', this.toggleTheme.bind(this));
    },

    carregarPlanos: async function() {
        try {
            const response = await fetch(API_PLANOS);
            if (response.ok) {
                const planos = await response.json();
                const select = document.getElementById('planoSelecionado');
                select.innerHTML = '<option value="" disabled selected>Selecione o Plano Desejado *</option>';
                planos.forEach(p => {
                    select.innerHTML += `<option value="${p.id}">${p.nomePlano} - R$${p.preco}</option>`;
                });
            }
        } catch (error) {
            console.error('Erro ao carregar planos:', error);
            document.getElementById('planoSelecionado').innerHTML = '<option value="" disabled selected>Erro ao carregar planos</option>';
        }
    },

    salvarAluno: async function(event) {
        event.preventDefault();

        if (!this.form.checkValidity() || !this.validarMac()) {
            event.stopPropagation();
            this.form.classList.add('was-validated');
            return;
        }

        const possuiMac = document.getElementById('possuiSmartwatch').checked;

        // CORREÇÃO: Pegar o ID e também o Nome do Plano que o usuário clicou
        const selectPlano = document.getElementById('planoSelecionado');
        const planoId = selectPlano.value;
        const nomeDoPlano = planoId ? selectPlano.options[selectPlano.selectedIndex].text.split(' - ')[0] : null;

        const dadosAluno = {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            dataNascimento: document.getElementById('dataNascimento').value,
            cidade: document.getElementById('cidade').value.trim(),
            condicaoMedica: document.getElementById('condicaoMedica').value.trim(),
            possuiSmartwatch: possuiMac,
            dispositivoMac: possuiMac ? document.getElementById('dispositivoMac').value.trim() : null,
            // Agora o Firebase vai receber o ID e o NOME do plano
            plano: planoId ? { id: planoId, nomePlano: nomeDoPlano } : null
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosAluno)
            });

            if (!response.ok) throw new Error('Erro ao salvar no servidor');

            UIHelper.showToast('Sucesso', 'Aluno matriculado com sucesso!', 'success');
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
        } catch (error) {
            UIHelper.showToast('Erro', 'Não foi possível cadastrar o aluno.', 'danger');
        }
    },

    validarMac: function() {
        if(!document.getElementById('possuiSmartwatch').checked) return true;
        const macVal = document.getElementById('dispositivoMac').value.trim();
        if (/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(macVal)) return true;
        document.getElementById('mac-feedback').style.display = 'block';
        return false;
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

class UIHelper {
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
        new bootstrap.Toast(document.getElementById(id), { delay: 4000 }).show();
    }
}