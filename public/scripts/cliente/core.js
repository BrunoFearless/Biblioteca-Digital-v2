// Estado compartilhado da tela cliente
let usuarioAtual = null;
let acaoAtual = null;
let livroAtual = null;
let livrosLocal = [];
let emprestimosLocal = [];
let reservasLocal = [];

function getGradientColor(text) {
    const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C'];
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

function initClienteContext() {
    let usuario = sessionStorage.getItem('usuario');
    if (usuario) {
        usuario = JSON.parse(usuario);
        if (!usuario.tipo) {
            usuario.tipo = 'aluno';
            sessionStorage.setItem('usuario', JSON.stringify(usuario));
        }
    }

    usuarioAtual = JSON.parse(sessionStorage.getItem('usuario'));
    if (!usuarioAtual || sessionStorage.getItem('modo') !== 'cliente') {
        delayedNavigate('/index.html');
        return false;
    }

    // Se o ID for um timestamp gigante gerado pelo localStorage antigo, forçamos o re-login
    if (usuarioAtual.id > 1000000000000) {
        sessionStorage.clear();
        alert('O sistema foi atualizado! Por favor, faça login novamente para sincronizar a sua conta.');
        delayedNavigate('/index.html');
        return false;
    }

    document.getElementById('userInfo').textContent = `Olá, ${usuarioAtual.nome}!`;
    return true;
}

async function carregarEmprestimosDoServidor() {
    try {
        const emprestimos = await fetch('/api/emprestimos').then((r) => r.json());
        const meusEmprestimos = emprestimos.filter((e) => e.usuario_id === usuarioAtual.id);
        emprestimosLocal = meusEmprestimos;
        localStorage.setItem(`emprestimos_${usuarioAtual.id}`, JSON.stringify(meusEmprestimos));
        return meusEmprestimos;
    } catch {
        emprestimosLocal = JSON.parse(localStorage.getItem(`emprestimos_${usuarioAtual.id}`) || '[]');
        return emprestimosLocal;
    }
}

async function carregarReservasDoServidor() {
    try {
        const reservas = await fetch('/api/reservas').then((r) => r.json());
        const minhasReservas = reservas.filter((r) => r.usuario_id === usuarioAtual.id);
        reservasLocal = minhasReservas;
        localStorage.setItem(`reservas_${usuarioAtual.id}`, JSON.stringify(minhasReservas));
        return minhasReservas;
    } catch {
        reservasLocal = JSON.parse(localStorage.getItem(`reservas_${usuarioAtual.id}`) || '[]');
        return reservasLocal;
    }
}

function fazerLogout() {
    sessionStorage.clear();
    delayedNavigate('/index.html');
}
