async function loadMeusEmprestimos() {
    try {
        const emprestimos = await fetch('/api/emprestimos').then((r) => r.json());
        const meus = emprestimos.filter((e) => e.usuario_id === usuarioAtual.id);
        let html = '';
        if (meus.length === 0) {
            html = '<div class="empty-state">Você não possui empréstimos no momento</div>';
        } else {
            html = `<table class="emprestimos-table"><thead><tr><th>Livro</th><th>Data Empréstimo</th><th>Data Devolução</th><th>Prazo Restante</th><th>Status</th><th>Ação</th></tr></thead><tbody>
                ${meus.map((e) => {
                    const hoje = new Date();
                    const dataDev = new Date(e.data_devolucao);
                    const diffDias = Math.ceil((dataDev - hoje) / (1000 * 60 * 60 * 24));
                    const prazoStr = diffDias > 0 ? `${diffDias} dia(s)` : diffDias === 0 ? 'Último dia!' : `<span style="color:#e74c3c;font-weight:bold;">Expirado (${Math.abs(diffDias)} dia(s))</span>`;
                    return `<tr><td>${e.livro_id}</td><td>${new Date(e.data_emprestimo).toLocaleDateString()}</td><td>${new Date(e.data_devolucao).toLocaleDateString()}</td><td>${prazoStr}</td><td><span class="status-badge ${e.devolvido ? 'status-devolvido' : 'status-ativo'}">${e.devolvido ? 'Devolvido' : 'Ativo'}</span></td><td>${!e.devolvido ? `<button class="btn-action btn-danger" onclick="abrirModal('return', ${e.id}, '')">Devolver</button>` : '-'}</td></tr>`;
                }).join('')}
            </tbody></table>`;
        }
        document.getElementById('emprestimosContent').innerHTML = html;
    } catch {
        document.getElementById('emprestimosContent').innerHTML = '<div class="empty-state">Erro ao carregar empréstimos</div>';
    }
}

function loadMinhasReservas() {
    let html = '';
    if (!reservasLocal || reservasLocal.length === 0) {
        html = '<div class="empty-state">Você não possui reservas no momento</div>';
    } else {
        html = `<table class="emprestimos-table"><thead><tr><th>Livro</th><th>Data Reserva</th><th>Status</th><th>Ação</th></tr></thead><tbody>
            ${reservasLocal.map((r) => `<tr><td>${r.livro_id}</td><td>${r.data_reserva ? new Date(r.data_reserva).toLocaleDateString() : '-'}</td><td><span class="status-badge ${r.status === 'ativa' ? 'status-ativo' : 'status-devolvido'}">${r.status === 'ativa' ? 'Ativa' : r.status === 'cancelada' ? 'Cancelada' : r.status}</span></td><td>${r.status === 'ativa' ? `<button class="btn-action btn-danger" onclick="cancelarReserva(${r.id})">Cancelar</button>` : '-'}</td></tr>`).join('')}
        </tbody></table>`;
    }
    document.getElementById('reservasContent').innerHTML = html;
}

async function cancelarReserva(id) {
    try {
        const resp = await fetch(`/api/reservas/${id}/cancelar`, { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
        const data = await resp.json();
        if (resp.ok) {
            alert('❌ Reserva cancelada com sucesso!');
            await carregarReservasDoServidor();
            loadMinhasReservas();
        } else {
            throw new Error(data.error || 'Erro ao cancelar reserva');
        }
    } catch (e) {
        alert(`Erro ao cancelar reserva: ${e.message}`);
    }
}
