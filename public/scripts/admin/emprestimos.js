async function loadEmprestimos() {
    try {
        const [emprestimos, livros, usuarios] = await Promise.all([
            fetch('/api/emprestimos').then(r => r.json()),
            fetch('/api/livros').then(r => r.json()),
            fetch('/api/usuarios').then(r => r.json())
        ]);

        let html = '';
        if (emprestimos.length === 0) {
            html = '<div class="empty-state">Nenhum empréstimo registrado</div>';
        } else {
            html = `<div class="table-container"><table class="data-table"><thead><tr>
                <th>ID</th><th>Usuário</th><th>Tipo</th><th>Livro</th><th>Data Empréstimo</th><th>Data Devolução</th><th>Status</th><th>Ações</th>
                </tr></thead><tbody>
                ${emprestimos.map(e => {
                    const usuario = usuarios.find(u => u.id === e.usuario_id);
                    const livro = livros.find(l => l.id === e.livro_id);
                    return `<tr>
                        <td>${e.id}</td>
                        <td>${usuario?.nome || 'Desconhecido'}</td>
                        <td>${usuario?.tipo ? (usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1)) : 'Aluno'}</td>
                        <td>${livro?.titulo || 'Desconhecido'}</td>
                        <td>${new Date(e.data_emprestimo).toLocaleDateString()}</td>
                        <td>${new Date(e.data_devolucao).toLocaleDateString()}</td>
                        <td>${e.devolvido ? '<span class="status-badge status-devolvido">Devolvido</span>' : '<span class="status-badge status-ativo">Pendente</span>'}</td>
                        <td>
                            ${!e.devolvido ? `<button class="action-btn btn-success" onclick="marcarDevolvido(${e.id})"><i class="ph ph-check"></i> Devolvido</button>` : ''}
                            <button class="action-btn btn-danger" onclick="deletarEmprestimo(${e.id})"><i class="ph ph-trash"></i> Deletar</button>
                        </td>
                    </tr>`;
                }).join('')}</tbody></table></div>`;
        }
        document.getElementById('emprestimosContent').innerHTML = html;
    } catch {
        document.getElementById('emprestimosContent').innerHTML = `<div class="empty-state">Erro ao carregar empréstimos</div>`;
    }
}

function marcarDevolvido(id) {
    fetch(`/api/emprestimos/${id}/devolver`, { method: 'PUT' })
        .then(r => {
            if (r.ok) {
                alert('Empréstimo marcado como devolvido');
                loadEmprestimos();
            }
        })
        .catch(() => alert('Erro ao marcar devolução'));
}

function deletarEmprestimo(id) {
    if (confirm('Tem certeza que deseja deletar este empréstimo?')) {
        alert('Funcionalidade em desenvolvimento');
    }
}
