function showSection(section) {
    const current = document.querySelector('.content-section.active');
    const activate = () => {
        document.querySelectorAll('.content-section').forEach((el) => el.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach((el) => el.classList.remove('active'));
        const target = document.getElementById(section);
        if (target) {
            target.classList.add('active', 'section-enter');
            setTimeout(() => target.classList.remove('section-enter'), 600);
        }
        document.querySelectorAll('.nav-btn').forEach((btn) => {
            const onclick = btn.getAttribute('onclick') || '';
            if (onclick.includes(section)) btn.classList.add('active');
        });
        if (section === 'catalogo') loadCatalogo();
        else if (section === 'meus-emprestimos') carregarEmprestimosDoServidor().then(() => loadMeusEmprestimos());
        else if (section === 'minhas-reservas') carregarReservasDoServidor().then(() => loadMinhasReservas());
        else if (section === 'meus-favoritos') loadFavoritos();
        else if (section === 'meu-perfil') loadPerfil();
    };

    if (current && current.id !== section) {
        current.classList.add('section-exit');
        setTimeout(() => {
            current.classList.remove('active', 'section-exit');
            activate();
        }, 450);
    } else {
        activate();
    }
}
