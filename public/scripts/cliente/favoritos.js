async function toggleFavorito(btn, livroId) {
    const ehFavorito = btn.classList.contains('active');
    const method = ehFavorito ? 'DELETE' : 'POST';

    try {
        const res = await fetch('/api/favoritos', {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: usuarioAtual.id, livro_id: livroId })
        });

        if (res.ok) {
            btn.classList.toggle('active');
            if (ehFavorito) {
                favoritosIds = favoritosIds.filter(id => id !== livroId);
            } else {
                favoritosIds.push(livroId);
            }
            // Se estivermos na seção de favoritos, recarregamos a vista
            if (document.getElementById('meus-favoritos').classList.contains('active')) {
                loadFavoritos();
            }
        }
    } catch (e) {
        console.error('Erro ao alternar favorito:', e);
    }
}

async function loadFavoritos() {
    try {
        const favoritos = await fetch(`/api/favoritos?usuario_id=${usuarioAtual.id}`).then(r => r.json());
        renderizarFavoritos(favoritos);
    } catch (e) {
        document.getElementById('favoritosContent').innerHTML = '<div class="empty-state">Erro ao carregar favoritos</div>';
    }
}

function renderizarFavoritos(livros) {
    let html = '<div class="books-grid">';
    if (livros.length === 0) {
        html = '<div class="empty-state">Ainda não tem livros nos seus favoritos. Comece a explorar o catálogo!</div>';
    } else {
        livros.forEach((livro) => {
            const capaUrl = (() => {
                if (!livro.capa_url) return null;
                let raw = String(livro.capa_url).replace(/\\/g, '/').replace(/^\/+/, '');
                return raw.startsWith('http') ? raw : `/${raw}`;
            })();

            html += `
                <div class="book-card" style="position: relative;">
                    <button class="favorite-btn active" onclick="toggleFavorito(this, ${livro.id})">
                        <i class="ph-fill ph-heart"></i>
                    </button>
                    <div class="book-cover" style="${capaUrl ? `background-image: url('${capaUrl}');` : `background: linear-gradient(135deg, ${getGradientColor(livro.titulo)} 0%, ${getGradientColor(livro.autor)} 100%);`}">
                        ${!capaUrl ? '📚' : ''}
                    </div>
                    <div class="book-details">
                        <div class="book-title">${livro.titulo}</div>
                        <div class="book-author">${livro.autor}</div>
                        <div class="action-buttons">
                            <button class="btn-action btn-success" onclick="abrirModal('borrow', ${livro.id}, '${livro.titulo.replace(/'/g, "\\'")}')">Pegar</button>
                        </div>
                    </div>
                </div>`;
        });
    }
    html += '</div>';
    document.getElementById('favoritosContent').innerHTML = html;
}
