if (initClienteContext()) {
    Promise.all([
        carregarEmprestimosDoServidor(),
        carregarReservasDoServidor()
    ]).then(() => {
        loadCatalogo();
        updateRightPanel();
    });
}

window.showSection = showSection;
window.filtrarLivros = filtrarLivros;
window.abrirModal = abrirModal;
window.fecharModal = fecharModal;
window.confirmarAcao = confirmarAcao;
window.cancelarReserva = cancelarReserva;
window.fazerLogout = fazerLogout;
window.mostrarLivrosPorCategoria = mostrarLivrosPorCategoria;
window.updateRightPanel = updateRightPanel;
