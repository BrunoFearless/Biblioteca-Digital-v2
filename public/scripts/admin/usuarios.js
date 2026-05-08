async function loadUsuarios() {
    try {
        const [usuarios, emprestimos, reservas] = await Promise.all([
            fetch('/api/usuarios').then(r => r.json()),
            fetch('/api/emprestimos').then(r => r.json()),
            fetch('/api/reservas').then(r => r.json()).catch(() => [])
        ]);

        let html = '';
        if (usuarios.length === 0) {
            html = '<div class="empty-state">Nenhum usuário cadastrado</div>';
        } else {
            html = `
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr><th>Nome</th><th>Email</th><th>Tipo</th><th>Telefone</th><th>Endereço</th><th>Emp. Ativos</th><th>Reservas</th><th>Ações</th></tr>
                        </thead>
                        <tbody>
                            ${usuarios.map(u => {
                                const empAtivos = emprestimos.filter(e => e.usuario_id === u.id && !e.devolvido).length;
                                const resAtivas = reservas.filter(r => r.usuario_id === u.id && r.status === 'ativa').length;
                                return `<tr>
                                    <td>${u.nome}</td><td>${u.email}</td>
                                    <td>${u.tipo ? (u.tipo.charAt(0).toUpperCase() + u.tipo.slice(1)) : 'Aluno'}</td>
                                    <td>${u.telefone}</td><td>${u.endereco}</td>
                                    <td style="color: ${empAtivos > 0 ? '#f39c12' : '#27ae60'}; font-weight: bold;">${empAtivos}</td>
                                    <td style="color: #3498db; font-weight: bold;">${resAtivas}</td>
                                    <td><button class="action-btn btn-info" onclick="verDetalhesUsuario(${u.id})">📋 Detalhes</button></td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>`;
        }
        document.getElementById('usuariosContent').innerHTML = html;
    } catch {
        document.getElementById('usuariosContent').innerHTML = `<div class="empty-state">Erro ao carregar usuários</div>`;
    }
}

function verDetalhesUsuario(id) {
    Promise.all([
        fetch('/api/usuarios').then(r => r.json()),
        fetch('/api/emprestimos').then(r => r.json()),
        fetch('/api/reservas').then(r => r.json()),
        fetch('/api/livros').then(r => r.json())
    ]).then(([usuarios, emprestimos, reservas, livros]) => {
        const usuario = usuarios.find(u => u.id === id);
        if (!usuario) return alert('Usuário não encontrado');
        document.getElementById('usuarioNome').textContent = usuario.nome;
        document.getElementById('usuarioEmail').textContent = usuario.email;
        document.getElementById('usuarioTelefone').textContent = usuario.telefone || '-';
        document.getElementById('usuarioEndereco').textContent = usuario.endereco || '-';

        const empAtivos = emprestimos.filter(e => e.usuario_id === id && !e.devolvido);
        document.getElementById('usuarioEmprestimos').innerHTML = empAtivos.length === 0
            ? '<p style="color: #666; font-size: 0.9em;">Nenhum empréstimo ativo</p>'
            : `<ul style="list-style: none; padding: 0;">${empAtivos.map(e => {
                const livro = livros.find(l => l.id === e.livro_id);
                return `<li style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">
                    <strong>${livro?.titulo || 'Livro não encontrado'}</strong>
                    <br><small style="color: #666;">📅 Emprestimado em: ${new Date(e.data_emprestimo).toLocaleDateString()}<br>📅 Devolução esperada: ${new Date(e.data_devolucao).toLocaleDateString()}</small>
                </li>`;
            }).join('')}</ul>`;

        const resAtivas = reservas.filter(r => r.usuario_id === id && r.status === 'ativa');
        document.getElementById('usuarioReservas').innerHTML = resAtivas.length === 0
            ? '<p style="color: #666; font-size: 0.9em;">Nenhuma reserva ativa</p>'
            : `<ul style="list-style: none; padding: 0;">${resAtivas.map(r => {
                const livro = livros.find(l => l.id === r.livro_id);
                return `<li style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">
                    <strong>${livro?.titulo || 'Livro não encontrado'}</strong>
                    <br><small style="color: #666;">📅 Reservado em: ${new Date(r.data_reserva).toLocaleDateString()}<br>🟦 Status: <span style="background: #cce5ff; color: #004085; padding: 2px 8px; border-radius: 10px;">${r.status}</span></small>
                </li>`;
            }).join('')}</ul>`;

        document.getElementById('modalUsuario').classList.add('show');
    }).catch(() => alert('Erro ao carregar detalhes do usuário'));
}

function fecharModalUsuario() {
    document.getElementById('modalUsuario').classList.remove('show');
}
