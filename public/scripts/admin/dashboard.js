async function loadDashboard() {
    try {
        const [livros, usuarios, emprestimos] = await Promise.all([
            fetch('/api/livros').then(r => r.json()),
            fetch('/api/usuarios').then(r => r.json()),
            fetch('/api/emprestimos').then(r => r.json())
        ]);

        const emprestimosPendentes = emprestimos.filter(e => !e.devolvido).length;

        const html = `
            <div class="stats">
                <div class="stat-card"><h3>${livros.length}</h3><p>Total de Livros</p></div>
                <div class="stat-card"><h3>${usuarios.length}</h3><p>Total de Usuários</p></div>
                <div class="stat-card"><h3>${emprestimos.length}</h3><p>Total de Empréstimos</p></div>
                <div class="stat-card"><h3>${emprestimosPendentes}</h3><p>Empréstimos Pendentes</p></div>
            </div>
            <h2 style="color: white; margin: 30px 0 20px 0;">Útimos Empréstimos</h2>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>ID</th><th>Usuário</th><th>Tipo</th><th>Livro</th><th>Data Empréstimo</th><th>Status</th></tr></thead>
                    <tbody>
                        ${emprestimos.slice(-5).reverse().map(e => {
                            const usuario = usuarios.find(u => u.id === e.usuario_id) || {};
                            const livro = livros.find(l => l.id === e.livro_id) || {};
                            return `<tr>
                                <td>${e.id}</td>
                                <td>${usuario.nome || 'Desconhecido'}</td>
                                <td>${usuario.tipo ? (usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1)) : 'Aluno'}</td>
                                <td>${livro.titulo || 'Desconhecido'}</td>
                                <td>${new Date(e.data_emprestimo).toLocaleDateString()}</td>
                                <td>${e.devolvido ? '✅ Devolvido' : '⏳ Pendente'}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>`;

        document.getElementById('dashboardContent').innerHTML = html;
    } catch {
        document.getElementById('dashboardContent').innerHTML = `<div class="empty-state">Erro ao carregar dashboard</div>`;
    }
}
