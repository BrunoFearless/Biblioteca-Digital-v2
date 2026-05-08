if (sessionStorage.getItem('modo') !== 'admin') {
    delayedNavigate('/index.html');
}

function fazerLogout() {
    sessionStorage.clear();
    delayedNavigate('/index.html');
}

// Carregar dashboard ao iniciar
loadDashboard();

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modalLivroElem = document.getElementById('modalLivro');
    const modalUsuarioElem = document.getElementById('modalUsuario');
    
    if (event.target === modalLivroElem) {
        fecharModal();
    }
    if (event.target === modalUsuarioElem) {
        fecharModalUsuario();
    }
};
