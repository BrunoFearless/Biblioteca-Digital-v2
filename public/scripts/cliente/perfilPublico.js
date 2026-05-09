async function abrirPerfilPublico(usuarioId) {
    if (!usuarioId) return;

    const modal = document.getElementById('modalPerfilPublico');
    const containerLendo = document.getElementById('pubUserLendo');
    const containerObras = document.getElementById('pubUserObras');
    const containerAtividade = document.getElementById('pubUserAtividade');
    
    // Resetar containers e mostrar skeletons/loading
    [containerLendo, containerObras, containerAtividade].forEach(c => c.innerHTML = '<div style="font-size: 0.8rem; color: #888;">Carregando...</div>');
    document.getElementById('pubStatLidos').textContent = '...';
    document.getElementById('pubStatPublicados').textContent = '...';
    document.getElementById('pubStatCriticas').textContent = '...';

    modal.style.display = 'flex';
    modal.classList.add('active');

    try {
        const res = await fetch(`/api/usuarios/publico/${usuarioId}`);
        if (!res.ok) throw new Error('Usuário não encontrado');
        const data = await res.json();

        // 1. Dados Básicos e Stats
        document.getElementById('pubUserName').textContent = data.nome;
        document.getElementById('pubUserAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nome)}&background=random&color=fff`;
        
        const lidosCount = data.emprestimos.filter(e => e.devolvido).length;
        document.getElementById('pubStatLidos').textContent = lidosCount;
        document.getElementById('pubStatPublicados').textContent = data.publicados.length;
        document.getElementById('pubStatCriticas').textContent = data.avaliacoes.length;

        // 2. Renderizar Leituras Atuais
        const atuais = data.emprestimos.filter(e => !e.devolvido);
        if (atuais.length > 0) {
            containerLendo.innerHTML = atuais.map(e => `
                <div style="background: white; padding: 12px; border-radius: 16px; border: 1px solid #eee; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                    <img src="${e.capa_url || ''}" style="width: 40px; height: 60px; object-fit: cover; border-radius: 6px; background: #eee;">
                    <div style="overflow: hidden;">
                        <div style="font-size: 0.85rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${e.titulo}</div>
                        <div style="font-size: 0.7rem; color: #888;">${e.autor}</div>
                    </div>
                </div>
            `).join('');
        } else {
            containerLendo.innerHTML = '<p style="font-size: 0.8rem; color: #aaa; font-style: italic;">Não está lendo nada de momento.</p>';
        }

        // 3. Renderizar Obras Publicadas
        if (data.publicados.length > 0) {
            containerObras.innerHTML = data.publicados.map(l => `
                <div style="background: white; padding: 12px; border-radius: 16px; border: 1px solid #eee; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                    <img src="${l.capa_url || ''}" style="width: 40px; height: 60px; object-fit: cover; border-radius: 6px; background: #eee;">
                    <div style="overflow: hidden;">
                        <div style="font-size: 0.85rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${l.titulo}</div>
                        <div style="font-size: 0.7rem; color: #888;">${l.autor}</div>
                    </div>
                </div>
            `).join('');
        } else {
            containerObras.innerHTML = '<p style="font-size: 0.8rem; color: #aaa; font-style: italic;">Nenhuma obra publicada.</p>';
        }

        // 4. Renderizar Atividade Recente (Críticas)
        if (data.avaliacoes.length > 0) {
            containerAtividade.innerHTML = data.avaliacoes.map(a => `
                <div style="background: white; padding: 15px; border-radius: 16px; border: 1px solid #eee; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong style="font-size: 0.85rem; color: #333;">${a.titulo_livro}</strong>
                        <div style="color: #f39c12; font-size: 0.7rem;">${'★'.repeat(a.nota)}${'☆'.repeat(5-a.nota)}</div>
                    </div>
                    <p style="font-size: 0.8rem; color: #666; font-style: italic; margin: 0; line-height: 1.4;">"${a.comentario || 'Sem comentário.'}"</p>
                    <div style="font-size: 0.65rem; color: #bbb; margin-top: 8px;">${new Date(a.data_avaliacao).toLocaleDateString()}</div>
                </div>
            `).join('');
        } else {
            containerAtividade.innerHTML = '<p style="font-size: 0.8rem; color: #aaa; font-style: italic;">Ainda não fez nenhuma avaliação.</p>';
        }

    } catch (error) {
        console.error('Erro ao carregar perfil público:', error);
        alert('Este usuário pode não existir ou houve um erro de conexão.');
        fecharPerfilPublico();
    }
}

function fecharPerfilPublico() {
    const modal = document.getElementById('modalPerfilPublico');
    modal.style.display = 'none';
    modal.classList.remove('active');
}
