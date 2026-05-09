function showSection(section) {
    const current = document.querySelector('.content-section.active');
    const activate = () => {
        document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
        const target = document.getElementById(section);
        if (target) {
            target.classList.add('active', 'section-enter');
            setTimeout(() => target.classList.remove('section-enter'), 380);
        }
        document.querySelectorAll('.nav-btn').forEach(btn => {
            const onclick = btn.getAttribute('onclick') || '';
            if (onclick.includes(section)) btn.classList.add('active');
        });
        if (section === 'dashboard') loadDashboard();
        else if (section === 'pendentes') carregarPendentes();
        else if (section === 'livros') loadLivros();
        else if (section === 'usuarios') loadUsuarios();
        else if (section === 'emprestimos') loadEmprestimos();
        else if (section === 'reservas') loadReservas();
        else if (section === 'relatorios') loadRelatorios();
    };

    if (current && current.id !== section) {
        current.classList.add('section-exit');
        setTimeout(() => {
            current.classList.remove('active', 'section-exit');
            activate();
        }, 260);
    } else {
        activate();
    }
}
