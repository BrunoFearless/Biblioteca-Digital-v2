async function loadReservas() {
    try {
        const [reservas, livros, usuarios] = await Promise.all([
            fetch('/api/reservas').then(r => r.json()),
            fetch('/api/livros').then(r => r.json()),
            fetch('/api/usuarios').then(r => r.json())
        ]);

        let html = '';
        if (reservas.length === 0) {
            html = '<div class="empty-state">Nenhuma reserva registrada</div>';
        } else {
            html = `<div class="table-container"><table class="data-table"><thead><tr>
                <th>ID</th><th>Usuário</th><th>Tipo</th><th>Email</th><th>Livro</th><th>Data Reserva</th><th>Status</th>
                </tr></thead><tbody>
                ${reservas.map(r => {
                    const usuario = usuarios.find(u => u.id === r.usuario_id);
                    const livro = livros.find(l => l.id === r.livro_id);
                    const statusColor = r.status === 'ativa' ? '#3498db' : r.status === 'cancelada' ? '#e74c3c' : '#27ae60';
                    return `<tr>
                        <td>${r.id}</td>
                        <td><strong>${usuario?.nome || 'Desconhecido'}</strong></td>
                        <td>${usuario?.tipo ? (usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1)) : 'Aluno'}</td>
                        <td>${usuario?.email || 'N/A'}</td>
                        <td>${livro?.titulo || 'Desconhecido'}</td>
                        <td>${new Date(r.data_reserva).toLocaleDateString()}</td>
                        <td><span style="background: ${statusColor}20; color: ${statusColor}; padding: 5px 10px; border-radius: 15px; font-weight: bold;">${r.status}</span></td>
                    </tr>`;
                }).join('')}</tbody></table></div>`;
        }

        document.getElementById('reservasContent').innerHTML = html;
    } catch {
        document.getElementById('reservasContent').innerHTML = `<div class="empty-state">Erro ao carregar reservas</div>`;
    }
}
