function abrirModal(acao, livroId, titulo) {
    acaoAtual = acao;
    livroAtual = livroId;
    const tipo = (usuarioAtual.tipo || '').toLowerCase();
    let prazo = 7, maxLivros = 3, label = 'aluno';
    if (tipo === 'professor') {
        prazo = 15; maxLivros = 6; label = 'professor';
    }
    const emprestimosAtivos = emprestimosLocal.filter((e) => !e.devolvido).length;
    if (acao === 'borrow') {
        document.getElementById('modalTitle').textContent = 'Pegar Livro Emprestado';
        document.getElementById('modalMessage').textContent = `Deseja pegar "${titulo}" emprestado?\n\nTipo: ${label.charAt(0).toUpperCase() + label.slice(1)}\nPrazo: ${prazo} dias\nLimite: ${maxLivros} livros simultâneos.\nVocê já possui ${emprestimosAtivos} empréstimo(s) ativo(s).`;
        if (emprestimosAtivos >= maxLivros) {
            setTimeout(() => {
                alert(`Limite de empréstimos atingido para ${label}.\nVocê só pode pegar até ${maxLivros} livros ao mesmo tempo.`);
                fecharModal();
            }, 100);
            return;
        }
    } else if (acao === 'reserve') {
        document.getElementById('modalTitle').textContent = 'Reservar Livro';
        document.getElementById('modalMessage').textContent = `Deseja reservar "${titulo}"?`;
    } else if (acao === 'return') {
        document.getElementById('modalTitle').textContent = 'Devolver Livro';
        document.getElementById('modalMessage').textContent = 'Deseja devolver este livro?';
    }
    document.getElementById('modal').classList.add('active');
}

function fecharModal() {
    document.getElementById('modal').classList.remove('active');
}

function confirmarAcao() {
    if (!usuarioAtual || !usuarioAtual.id) return alert('ERRO: Usuário não autenticado. Faça login novamente.');
    if (!livroAtual) return alert('ERRO: Livro não selecionado.');

    if (acaoAtual === 'borrow') {
        const tipo = (usuarioAtual.tipo || '').toLowerCase();
        let prazo = 7, maxLivros = 3, label = 'aluno';
        if (tipo === 'professor') { prazo = 15; maxLivros = 6; label = 'professor'; }
        const emprestimosAtivos = emprestimosLocal.filter((e) => !e.devolvido).length;
        if (emprestimosAtivos >= maxLivros) {
            alert(`Limite de empréstimos atingido para ${label}.\nVocê só pode pegar até ${maxLivros} livros ao mesmo tempo.`);
            return fecharModal();
        }
        const dataDevolucao = new Date(Date.now() + prazo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        fetch('/api/emprestimos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: usuarioAtual.id, livro_id: livroAtual, data_emprestimo: new Date().toISOString().split('T')[0], data_devolucao: dataDevolucao }),
        })
            .then((r) => r.json().then((data) => ({ status: r.status, data })))
            .then(({ status, data }) => {
                if (status >= 200 && status < 300) {
                    alert('✅ Livro pego com sucesso!');
                    fecharModal();
                    carregarEmprestimosDoServidor().then(() => loadCatalogo());
                } else {
                    throw new Error(data.error || 'Erro ao pegar livro');
                }
            })
            .catch((e) => { alert(`❌ Erro: ${e.message}\n\nTente novamente.`); fecharModal(); });
    } else if (acaoAtual === 'reserve') {
        fetch('/api/reservas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: usuarioAtual.id, livro_id: livroAtual }),
        })
            .then((r) => r.json().then((data) => ({ status: r.status, data })))
            .then(({ status, data }) => {
                if (status >= 200 && status < 300) {
                    alert('✅ Livro reservado com sucesso!');
                    fecharModal();
                    carregarReservasDoServidor().then(() => loadCatalogo());
                } else {
                    throw new Error(data.error || 'Erro ao reservar livro');
                }
            })
            .catch((e) => { alert(`❌ Erro: ${e.message}\n\nTente novamente.`); fecharModal(); });
    } else if (acaoAtual === 'return') {
        fetch(`/api/emprestimos/${livroAtual}/devolver`, { method: 'PUT', headers: { 'Content-Type': 'application/json' } })
            .then((r) => r.json().then((data) => ({ status: r.status, data })))
            .then(({ status, data }) => {
                if (status >= 200 && status < 300) {
                    alert('✅ Livro devolvido com sucesso!');
                    fecharModal();
                    loadMeusEmprestimos();
                } else {
                    throw new Error(data.error || 'Erro ao devolver livro');
                }
            })
            .catch((e) => { alert(`❌ Erro: ${e.message}`); fecharModal(); });
    }
}
