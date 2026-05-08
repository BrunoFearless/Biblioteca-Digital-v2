async function loadRelatorios() {
    try {
        const [livrosMaisEmprestados, emprestimosPendentes, emprestimos, reservas, livros, usuarios] = await Promise.all([
            fetch('/api/relatorios/livros-mais-emprestados').then(r => r.json()),
            fetch('/api/relatorios/emprestimos-pendentes').then(r => r.json()),
            fetch('/api/emprestimos').then(r => r.json()),
            fetch('/api/reservas').then(r => r.json()),
            fetch('/api/livros').then(r => r.json()),
            fetch('/api/usuarios').then(r => r.json())
        ]);

        const html = `
            <h2 style="color: white; margin-bottom: 20px;">📊 Resumo Geral</h2>
            <div class="stats">
                <div class="stat-card"><h3>${emprestimos.length}</h3><p>Total de Empréstimos</p></div>
                <div class="stat-card"><h3>${reservas.length}</h3><p>Total de Reservas</p></div>
                <div class="stat-card"><h3>${emprestimos.filter(e => !e.devolvido).length}</h3><p>Empréstimos Pendentes</p></div>
                <div class="stat-card"><h3>${reservas.filter(r => r.status === 'ativa').length}</h3><p>Reservas Ativas</p></div>
            </div>
            <h2 style="color: white; margin: 30px 0 20px 0;">📈 Gráficos</h2>
            <div class="charts-grid"><div class="chart-container"><canvas id="chartLivrosMais"></canvas></div><div class="chart-container"><canvas id="chartReserveStatus"></canvas></div></div>
            <h2 style="color: white; margin: 30px 0 20px 0;">📚 Top 10 Livros Mais Emprestados</h2>
            <div class="table-container"><table class="data-table"><thead><tr><th>Ranking</th><th>Título</th><th>Autor</th><th>Vezes Emprestado</th><th>Gênero</th></tr></thead><tbody>
                ${livrosMaisEmprestados.slice(0, 10).map((l, idx) => `<tr><td><strong>#${idx + 1}</strong></td><td><strong>${l.titulo}</strong></td><td>${l.autor}</td><td style="color: #2ecc71; font-weight: bold;">${l.vezes_emprestado}</td><td>${l.genero || '-'}</td></tr>`).join('')}
            </tbody></table></div>
            <h2 style="color: white; margin: 30px 0 20px 0;">⏳ Empréstimos Pendentes de Devolução</h2>
            <div class="table-container"><table class="data-table"><thead><tr><th>Usuário</th><th>Tipo</th><th>Email</th><th>Livro</th><th>Data Empréstimo</th><th>Data Devolução (esperada)</th><th>Dias de Atraso</th></tr></thead><tbody>
                ${emprestimosPendentes.map(e => {
                    const diasAtraso = Math.floor((new Date() - new Date(e.data_devolucao)) / (1000 * 60 * 60 * 24));
                    const corAtraso = diasAtraso > 0 ? '#e74c3c' : '#27ae60';
                    return `<tr><td><strong>${e.nome}</strong></td><td>${e.tipo ? (e.tipo.charAt(0).toUpperCase() + e.tipo.slice(1)) : 'Aluno'}</td><td>${e.email}</td><td>${e.titulo}</td><td>${new Date(e.data_emprestimo).toLocaleDateString()}</td><td>${new Date(e.data_devolucao).toLocaleDateString()}</td><td style="color: ${corAtraso}; font-weight: bold;">${diasAtraso > 0 ? `${diasAtraso} dias atrasado` : 'No prazo'}</td></tr>`;
                }).join('')}
            </tbody></table></div>
            <h2 style="color: white; margin: 30px 0 20px 0;">⭐ Reservas Ativas</h2>
            <div class="table-container"><table class="data-table"><thead><tr><th>Usuário</th><th>Tipo</th><th>Email</th><th>Livro</th><th>Data da Reserva</th><th>Status</th></tr></thead><tbody>
                ${reservas.filter(r => r.status !== 'cancelada').map(r => {
                    const usuario = usuarios.find(u => u.id === r.usuario_id) || {};
                    const livro = livros.find(l => l.id === r.livro_id) || {};
                    return `<tr><td><strong>${usuario.nome || 'Desconhecido'}</strong></td><td>${usuario.tipo ? (usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1)) : 'Aluno'}</td><td>${usuario.email || '-'}</td><td>${livro.titulo || 'Desconhecido'}</td><td>${new Date(r.data_reserva).toLocaleDateString()}</td><td><span style="background: #cce5ff; color: #004085; padding: 5px 10px; border-radius: 15px; font-weight: bold;">✅ ${r.status}</span></td></tr>`;
                }).join('')}
            </tbody></table></div>`;

        document.getElementById('relatoriosContent').innerHTML = html;
        setTimeout(() => {
            criarGraficoLivrosMais(livrosMaisEmprestados);
            criarGraficoReserveStatus(reservas);
        }, 100);
    } catch {
        document.getElementById('relatoriosContent').innerHTML = `<div class="empty-state">Erro ao carregar relatórios</div>`;
    }
}

function criarGraficoLivrosMais(livrosMaisEmprestados) {
    const top5 = livrosMaisEmprestados.slice(0, 5);
    const ctx = document.getElementById('chartLivrosMais');
    if (!ctx) return;
    new Chart(ctx, { type: 'bar', data: { labels: top5.map(l => l.titulo.substring(0, 20)), datasets: [{ label: 'Vezes Emprestado', data: top5.map(l => l.vezes_emprestado), backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF'], borderColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF'], borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false } });
}

function criarGraficoReserveStatus(reservas) {
    const statusCount = { ativa: reservas.filter(r => r.status === 'ativa').length, cancelada: reservas.filter(r => r.status === 'cancelada').length, efetivada: reservas.filter(r => r.status === 'efetivada').length };
    const ctx = document.getElementById('chartReserveStatus');
    if (!ctx) return;
    new Chart(ctx, { type: 'doughnut', data: { labels: ['Ativa', 'Cancelada', 'Efetivada'], datasets: [{ data: [statusCount.ativa, statusCount.cancelada, statusCount.efetivada], backgroundColor: ['#3498db','#e74c3c','#2ecc71'], borderColor: ['#2980b9','#c0392b','#27ae60'], borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false } });
}
