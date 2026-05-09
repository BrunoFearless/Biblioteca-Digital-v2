let livroParaAvaliar = null;
let notaSelecionada = 0;

function abrirModalAvaliacao(livroId) {
    livroParaAvaliar = livroId;
    notaSelecionada = 0;
    document.getElementById('modalAvaliacao').classList.add('active');
    resetEstrelas();
}

function fecharModalAvaliacao() {
    document.getElementById('modalAvaliacao').classList.remove('active');
    document.getElementById('reviewComment').value = '';
}

function resetEstrelas() {
    const estrelas = document.querySelectorAll('#starContainer i');
    estrelas.forEach(s => {
        s.classList.remove('ph-fill', 'active');
        s.classList.add('ph');
    });
}

document.addEventListener('click', (e) => {
    if (e.target.matches('#starContainer i')) {
        const val = parseInt(e.target.dataset.value);
        notaSelecionada = val;
        const estrelas = document.querySelectorAll('#starContainer i');
        estrelas.forEach((s, idx) => {
            if (idx < val) {
                s.classList.add('ph-fill', 'active');
                s.classList.remove('ph');
            } else {
                s.classList.remove('ph-fill', 'active');
                s.classList.add('ph');
            }
        });
    }
});

async function enviarAvaliacao() {
    if (notaSelecionada === 0) {
        alert('Por favor, selecione pelo menos uma estrela!');
        return;
    }
    const comentario = document.getElementById('reviewComment').value;
    try {
        const res = await fetch('/api/avaliacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: usuarioAtual.id,
                livro_id: livroParaAvaliar,
                nota: notaSelecionada,
                comentario: comentario
            })
        });
        if (res.ok) {
            alert('⭐ Obrigado pela sua avaliação!');
            fecharModalAvaliacao();
            loadCatalogo();
        } else {
            const data = await res.json();
            alert('Erro: ' + data.error);
        }
    } catch (e) {
        console.error('Erro ao enviar avaliação:', e);
    }
}

async function abrirModalReviews(livroId, titulo) {
    const container = document.getElementById('reviewsListContainer');
    document.getElementById('reviewModalTitle').textContent = `Críticas: ${titulo}`;
    document.getElementById('modalVerReviews').classList.add('active');
    container.innerHTML = '<div class="loading">Carregando críticas...</div>';

    try {
        const reviews = await fetch(`/api/avaliacoes/livro/${livroId}`).then(r => r.json());
        
        if (reviews.length === 0) {
            container.innerHTML = '<p class="empty-state">Este livro ainda não tem comentários. Seja o primeiro a avaliar!</p>';
            return;
        }

        container.innerHTML = reviews.map(r => `
            <div class="friend-item" style="margin-bottom: 20px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 15px;">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(r.usuario_nome)}&background=random&color=fff" alt="${r.usuario_nome}">
                <div class="friend-info">
                    <div style="display: flex; justify-content: space-between;">
                        <strong>${r.usuario_nome}</strong>
                        <span style="font-size: 11px; color: var(--text-secondary);">${new Date(r.data_avaliacao).toLocaleDateString()}</span>
                    </div>
                    <div style="color: #f39c12; font-size: 12px; margin: 4px 0;">
                        ${'★'.repeat(r.nota)}${'☆'.repeat(5-r.nota)}
                    </div>
                    <p style="font-style: italic; color: var(--text-primary); margin-top: 5px;">
                        "${r.comentario || 'Sem comentário escrito.'}"
                    </p>
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = '<p class="empty-state">Erro ao carregar críticas.</p>';
    }
}

function fecharModalReviews() {
    document.getElementById('modalVerReviews').classList.remove('active');
}

async function abrirModalDetalhes(livroId) {
    const livro = livrosLocal.find(l => l.id === livroId);
    if (!livro) return;

    livroParaAvaliar = livroId;
    notaSelecionada = 0;
    
    document.getElementById('detalheTituloLivro').textContent = livro.titulo;
    document.getElementById('detalheTitulo').textContent = livro.titulo;
    document.getElementById('detalheAutor').textContent = `por ${livro.autor}`;
    document.getElementById('detalheDescricao').textContent = livro.descricao || "Este livro ainda não possui uma descrição detalhada.";
    document.getElementById('detalheMeta').innerHTML = `<span>${livro.genero || livro.categoria}</span> • <span>${livro.ano_publicacao}</span>`;
    
    // Capa
    const capaUrl = (() => {
        if (!livro.capa_url) return null;
        let raw = String(livro.capa_url).replace(/\\/g, '/').replace(/^\/+/, '');
        return raw.startsWith('http') ? raw : `/${raw}`;
    })();
    document.getElementById('detalheCapaContainer').style.backgroundImage = capaUrl ? `url('${capaUrl}')` : `linear-gradient(135deg, ${getGradientColor(livro.titulo)} 0%, ${getGradientColor(livro.autor)} 100%)`;
    document.getElementById('detalheCapaContainer').style.backgroundSize = 'cover';
    document.getElementById('detalheCapaContainer').style.backgroundPosition = 'center';

    // Ações (Botões)
    const jaPeguei = emprestimosLocal.some(e => e.livro_id === livroId && !e.devolvido);
    const jaReservei = reservasLocal.some(r => r.livro_id === livroId && r.status === 'ativa');
    document.getElementById('detalheAcoes').innerHTML = `
        <button class="btn-action btn-success" style="padding: 12px;" onclick="abrirModal('borrow', ${livro.id}, '${livro.titulo.replace(/'/g, "\\'")}')" ${jaPeguei || livro.estoque === 0 ? 'disabled' : ''}>
            ${jaPeguei ? '✓ Já Requisitado' : 'Pegar Emprestado'}
        </button>
        <button class="btn-action btn-info" style="padding: 12px;" onclick="abrirModal('reserve', ${livro.id}, '${livro.titulo.replace(/'/g, "\\'")}')" ${jaReservei ? 'disabled' : ''}>
            ${jaReservei ? '✓ Já Reservado' : 'Reservar Livro'}
        </button>
        ${livro.pdf_url ? `<button class="btn-primary" style="padding: 12px; width: 100%; margin-top: 10px;" onclick="abrirLeitor(${livro.id})"><i class="ph ph-book-open"></i> Ler Agora Online</button>` : ''}
    `;

    // Reviews
    const reviewsContainer = document.getElementById('detalheReviewsLista');
    reviewsContainer.innerHTML = '<div class="loading">Carregando críticas...</div>';
    
    const reviews = await fetch(`/api/avaliacoes/livro/${livroId}`).then(r => r.json());
    if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<p style="text-align:center; color:gray; margin-top:20px;">Ainda não há críticas para este livro.</p>';
    } else {
        reviewsContainer.innerHTML = reviews.map(r => `
            <div class="friend-item" style="margin-bottom: 20px; border-bottom: 1px solid rgba(0,0,0,0.03); padding-bottom: 15px;">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(r.usuario_nome)}&background=random&color=fff" style="width:32px; height:32px;">
                <div class="friend-info">
                    <strong>${r.usuario_nome}</strong>
                    <div style="color: #f39c12; font-size: 11px;">${'★'.repeat(r.nota)}${'☆'.repeat(5-r.nota)}</div>
                    <p style="font-size: 13px; margin-top: 5px;">"${r.comentario || ''}"</p>
                </div>
            </div>
        `).join('');
    }

    // Mostrar área de avaliar se o utilizador já teve este livro (emprestado ou devolvido)
    const jaTeve = emprestimosLocal.some(e => e.livro_id === livroId);
    document.getElementById('areaAvaliarInjetada').style.display = jaTeve ? 'block' : 'none';
    resetEstrelasDetalhes();

    document.getElementById('modalDetalhesLivro').classList.add('active');
}

function fecharModalDetalhes() {
    document.getElementById('modalDetalhesLivro').classList.remove('active');
}

function resetEstrelasDetalhes() {
    const estrelas = document.querySelectorAll('#detalheStarContainer i');
    estrelas.forEach(s => { s.classList.remove('ph-fill', 'active'); s.classList.add('ph'); });
}

document.addEventListener('click', (e) => {
    if (e.target.matches('#detalheStarContainer i')) {
        const val = parseInt(e.target.dataset.value);
        notaSelecionada = val;
        const estrelas = document.querySelectorAll('#detalheStarContainer i');
        estrelas.forEach((s, idx) => {
            if (idx < val) { s.classList.add('ph-fill', 'active'); s.classList.remove('ph'); }
            else { s.classList.remove('ph-fill', 'active'); s.classList.add('ph'); }
        });
    }
});

async function enviarAvaliacaoDetalhes() {
    if (notaSelecionada === 0) { alert('Selecione uma nota!'); return; }
    const comentario = document.getElementById('detalheReviewComment').value;
    try {
        const res = await fetch('/api/avaliacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: usuarioAtual.id, livro_id: livroParaAvaliar, nota: notaSelecionada, comentario })
        });
        if (res.ok) {
            showSuccessFeedback('⭐ Avaliação enviada com sucesso!');
            document.getElementById('detalheReviewComment').value = '';
            abrirModalDetalhes(livroParaAvaliar);
            loadCatalogo();
        }
    } catch (e) { console.error(e); }
}
