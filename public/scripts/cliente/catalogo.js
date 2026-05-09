let favoritosIds = [];
let avaliacoesMedias = {};

async function loadCatalogo() {
    try {
        const [livros, favoritos, avaliacoes] = await Promise.all([
            fetch('/api/livros').then((r) => r.json()),
            fetch(`/api/favoritos/ids?usuario_id=${usuarioAtual.id}`).then((r) => r.json()),
            fetch('/api/avaliacoes/medias').then((r) => r.json())
        ]);
        
        livrosLocal = livros;
        favoritosIds = favoritos;
        avaliacoesMedias = avaliacoes.reduce((acc, curr) => {
            acc[curr.livro_id] = curr;
            return acc;
        }, {});
        
        renderizarPills();
        renderizarLivros(livros);
    } catch (e) {
        console.error(e);
        document.getElementById('catalogoContent').innerHTML = '<div class="empty-state">Erro ao carregar catálogo</div>';
    }
}

function renderizarPills() {
    const categorias = ['Todos', ...new Set(livrosLocal.map(l => l.genero || l.categoria).filter(Boolean))];
    const container = document.getElementById('categoryPills');
    container.innerHTML = categorias.map(cat => `
        <button class="pill ${cat === 'Todos' ? 'active' : ''}" onclick="filtrarPorCategoria(this, '${cat}')">${cat}</button>
    `).join('');
}

function filtrarPorCategoria(btn, categoria) {
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    
    const filtrados = categoria === 'Todos' 
        ? livrosLocal 
        : livrosLocal.filter(l => (l.genero || l.categoria) === categoria);
    renderizarLivros(filtrados);
}

function filtrarLivros() {
    const termo = document.getElementById('searchInput').value.toLowerCase();
    const filtrados = livrosLocal.filter(
        (l) => l.titulo.toLowerCase().includes(termo) || l.autor.toLowerCase().includes(termo) || (l.genero || l.categoria || '').toLowerCase().includes(termo)
    );
    renderizarLivros(filtrados);
}

function renderizarLivros(livros) {
    let html = '<div class="books-grid">';
    if (livros.length === 0) {
        html = '<div class="empty-state">Nenhum livro encontrado</div>';
    } else {
        livros.forEach((livro) => {
            const jaPegueiEmprestado = emprestimosLocal.some((e) => e.livro_id === livro.id && !e.devolvido);
            const jaReservei = reservasLocal.some((r) => r.livro_id === livro.id && r.status === 'ativa');
            const ehFavorito = favoritosIds.includes(livro.id);
            const avaliacao = avaliacoesMedias[livro.id] || { media: 0, total_avaliacoes: 0 };
            
            const capaUrl = (() => {
                if (!livro.capa_url) return null;
                let raw = String(livro.capa_url).replace(/\\/g, '/');
                raw = raw.replace(/^\/+/, '');
                return raw.startsWith('http') ? raw : `/${raw}`;
            })();

            html += `
                <div class="book-card" style="position: relative;" onclick="abrirModalDetalhes(${livro.id})">
                    <button class="favorite-btn ${ehFavorito ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorito(this, ${livro.id})">
                        <i class="ph-fill ph-heart"></i>
                    </button>
                    <div class="book-cover" style="${capaUrl ? `background-image: url('${capaUrl}'); background-size: cover; background-position: center;` : `background: linear-gradient(135deg, ${getGradientColor(livro.titulo)} 0%, ${getGradientColor(livro.autor)} 100%);`}">
                        ${!capaUrl ? '📚' : ''}
                    </div>
                    <div class="book-details">
                        <div class="book-title">${livro.titulo}</div>
                        <div class="book-author">${livro.autor}</div>
                        
                        <div class="book-rating">
                            <i class="ph-fill ph-star"></i>
                            <span>${Number(avaliacao.media).toFixed(1)}</span>
                            <span class="rating-count">(${avaliacao.total_avaliacoes})</span>
                        </div>

                        <div class="book-meta"><span>${livro.genero || livro.categoria}</span><span>${livro.ano_publicacao}</span></div>
                        <div class="stock-info">${livro.estoque > 0 ? `⏱️ ${livro.estoque} disponível` : '❌ Indisponível'}</div>
                        <div class="action-buttons">
                            <button class="btn-action btn-borrow btn-success" onclick="event.stopPropagation(); abrirModal('borrow', ${livro.id}, '${livro.titulo.replace(/'/g, "\\'")}')" ${jaPegueiEmprestado || livro.estoque === 0 ? 'disabled' : ''}>
                                ${jaPegueiEmprestado ? '✓ Pegado' : 'Pegar'}
                            </button>
                            <button class="btn-action btn-reserve btn-info" onclick="event.stopPropagation(); abrirModal('reserve', ${livro.id}, '${livro.titulo.replace(/'/g, "\\'")}')" ${jaReservei ? 'disabled' : ''}>
                                ${jaReservei ? '✓ Reservado' : 'Reservar'}
                            </button>
                        </div>
                    </div>
                </div>`;
        });
    }
    html += '</div>';
    document.getElementById('catalogoContent').innerHTML = html;
}

async function loadCategorias() {
    try {
        const livros = await fetch('/api/livros').then((r) => r.json());
        livrosLocal = livros;
        const categorias = [...new Set(livros.map((l) => l.genero || l.categoria).filter(Boolean))];
        document.getElementById('categoriasList').innerHTML = categorias
            .map((cat) => {
                const catEsc = encodeURIComponent(cat);
                return `<button class="nav-btn" style="background: #C08A4A; color: white;" onclick="mostrarLivrosPorCategoria(decodeURIComponent('${catEsc}'))">${cat}</button>`;
            })
            .join('');
        document.getElementById('categoriasContent').innerHTML = '<div class="empty-state">Selecione uma categoria para ver os livros.</div>';
    } catch {
        document.getElementById('categoriasContent').innerHTML = '<div class="empty-state">Erro ao carregar categorias</div>';
    }
}

function mostrarLivrosPorCategoria(categoria) {
    const normalizar = (str) => (str || '').trim().toLowerCase();
    const livros = livrosLocal.filter((l) => normalizar(l.genero || l.categoria) === normalizar(categoria));
    let html = '<div class="books-grid">';
    if (livros.length === 0) {
        html = '<div class="empty-state">Nenhum livro nesta categoria</div>';
    } else {
        livros.forEach((livro) => {
            let capaUrl = '';
            if (livro.capa_url) {
                let raw = String(livro.capa_url).replace(/\\/g, '/').replace(/^\/+/, '');
                capaUrl = raw.startsWith('http') ? raw : `/${raw}`;
            }
            html += `<div class="book-card">
                <div class="book-cover" style="${capaUrl ? `background-image: url('${capaUrl}');` : `background: linear-gradient(135deg, ${getGradientColor(livro.titulo)} 0%, ${getGradientColor(livro.autor)} 100%);`}">${!capaUrl ? '📚' : ''}</div>
                <div class="book-details">
                    <div class="book-title">${livro.titulo}</div>
                    <div class="book-author">${livro.autor}</div>
                    <div class="book-meta"><span>${livro.genero || livro.categoria}</span><span>${livro.ano_publicacao}</span></div>
                    <div class="stock-info">${livro.estoque > 0 ? `⏱️ ${livro.estoque} disponível` : '❌ Indisponível'}</div>
                    <div class="action-buttons">
                        <button class="btn-action btn-borrow btn-success" onclick="abrirModal('borrow', ${livro.id}, '${livro.titulo.replace(/'/g, "\\'")}')" ${livro.estoque === 0 ? 'disabled' : ''}>Pegar</button>
                        <button class="btn-action btn-reserve btn-info" onclick="abrirModal('reserve', ${livro.id}, '${livro.titulo.replace(/'/g, "\\'")}')">Reservar</button>
                    </div>
                </div>
            </div>`;
        });
    }
    html += '</div>';
    document.getElementById('categoriasContent').innerHTML = html;
}
