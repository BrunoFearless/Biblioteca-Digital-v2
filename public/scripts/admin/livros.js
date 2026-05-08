let modalLivro = null;

document.addEventListener('DOMContentLoaded', function() {
    const capaArquivoInput = document.getElementById('formCapaArquivo');
    if (capaArquivoInput) {
        capaArquivoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('capaImg').src = event.target.result;
                    document.getElementById('capaPreview').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

async function loadLivros() {
    try {
        const livros = await fetch('/api/livros').then(r => r.json());
        let html = '<div class="books-grid">';
        if (livros.length === 0) {
            html = '<div class="empty-state">Nenhum livro cadastrado</div>';
        } else {
            livros.forEach(livro => {
                const stockClass = livro.estoque > 2 ? 'stock-available' : livro.estoque > 0 ? 'stock-low' : 'stock-unavailable';
                const stockText = livro.estoque > 0 ? `${livro.estoque} em estoque` : 'Indisponível';
                const capaUrl = (function(){
                    if (!livro.capa_url) return null;
                    let raw = String(livro.capa_url).replace(/\\/g, '/');
                    raw = raw.replace(/^\/+/, '');
                    return raw.startsWith('http') ? raw : ('/' + raw);
                })();
                html += `
                    <div class="book-card">
                        <div class="book-cover" style="${capaUrl ? `background-image: url('${capaUrl}'); background-size: cover; background-position: center;` : `background: linear-gradient(135deg, ${getGradientColor(livro.titulo)} 0%, ${getGradientColor(livro.autor)} 100%);`}">
                            ${!capaUrl ? '<span>📚</span>' : ''}
                        </div>
                        <div class="book-info">
                            <div class="book-title">${livro.titulo}</div>
                            <div class="book-author">${livro.autor}</div>
                            <div class="book-meta"><span>${livro.genero}</span><span>${livro.ano_publicacao}</span></div>
                            <div class="stock-info"><span class="stock-badge ${stockClass}">${stockText}</span></div>
                            <div class="action-buttons">
                                <button class="action-btn btn-info" onclick="editarLivro(${livro.id})"><i class="ph ph-pencil-simple"></i> Editar</button>
                                <button class="action-btn btn-danger" onclick="deletarLivro(${livro.id})"><i class="ph ph-trash"></i> Deletar</button>
                            </div>
                        </div>
                    </div>`;
            });
        }
        html += '</div>';
        document.getElementById('livrosContent').innerHTML = html;
    } catch {
        document.getElementById('livrosContent').innerHTML = `<div class="empty-state">Erro ao carregar livros</div>`;
    }
}

function editarLivro(id) {
    if (id === 0) {
        document.getElementById('modalTitulo').textContent = 'Adicionar Novo Livro';
        document.getElementById('formLivro').reset();
        document.getElementById('formAno').value = new Date().getFullYear();
        document.getElementById('formEstoque').value = 1;
        document.getElementById('capaPreview').style.display = 'none';
        document.getElementById('formCapaArquivo').value = '';
        modalLivro = 'novo';
        abrirModal();
    } else {
        document.getElementById('modalTitulo').textContent = 'Editar Livro';
        fetch(`/api/livros/${id}`).then(r => {
            if (!r.ok) throw new Error(`Erro ao carregar livro: ${r.status}`);
            return r.json();
        }).then(livro => {
            document.getElementById('formTitulo').value = livro.titulo || '';
            document.getElementById('formAutor').value = livro.autor || '';
            document.getElementById('formGenero').value = livro.genero || '';
            document.getElementById('formAno').value = livro.ano_publicacao || new Date().getFullYear();
            document.getElementById('formEstoque').value = livro.estoque || 1;
            document.getElementById('formCapaUrl').value = livro.capa_url || '';
            document.getElementById('formCapaArquivo').value = '';
            document.getElementById('formDescricao').value = livro.descricao || '';
            if (livro.capa_url) {
                let raw = String(livro.capa_url).replace(/\\/g, '/').replace(/^\/+/, '');
                const capaUrl = raw.startsWith('http') ? raw : ('/' + raw);
                document.getElementById('capaImg').src = capaUrl;
                document.getElementById('capaPreview').style.display = 'block';
            } else {
                document.getElementById('capaPreview').style.display = 'none';
            }
            modalLivro = id;
            abrirModal();
        }).catch(err => alert('Erro ao carregar livro: ' + err.message));
    }
}

function abrirModal() { document.getElementById('modalLivro').classList.add('show'); }
function fecharModal() {
    document.getElementById('modalLivro').classList.remove('show');
    document.getElementById('formLivro').reset();
    document.getElementById('formCapaArquivo').value = '';
    document.getElementById('capaPreview').style.display = 'none';
    modalLivro = null;
}

async function salvarLivro(event) {
    event.preventDefault();
    const titulo = document.getElementById('formTitulo').value.trim();
    const autor = document.getElementById('formAutor').value.trim();
    const genero = document.getElementById('formGenero').value;
    const ano = document.getElementById('formAno').value;
    const estoque = document.getElementById('formEstoque').value;
    const capaArquivo = document.getElementById('formCapaArquivo').files[0];
    const capaUrl = document.getElementById('formCapaUrl').value.trim();
    const descricao = document.getElementById('formDescricao').value.trim();
    if (!titulo || !autor || !genero || !ano || !estoque) return alert('Por favor, preencha todos os campos obrigatórios!');
    const submitBtn = event.target.querySelector('.btn-submit') || document.querySelector('#formLivro .btn-submit');
    if (!submitBtn) return alert('Erro: não foi possível localizar o botão de save');
    const btnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Salvando...';
    try {
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('autor', autor);
        formData.append('genero', genero);
        formData.append('ano_publicacao', parseInt(ano));
        formData.append('estoque', parseInt(estoque));
        formData.append('descricao', descricao);
        if (capaArquivo) formData.append('capa', capaArquivo);
        else if (capaUrl) formData.append('capa_url', capaUrl);
        const url = modalLivro === 'novo' ? '/api/livros' : `/api/livros/${modalLivro}`;
        const metodo = modalLivro === 'novo' ? 'POST' : 'PUT';
        const res = await fetch(url, { method: metodo, body: formData });
        const resposta = await res.json();
        if (res.ok) {
            alert(modalLivro === 'novo' ? 'Livro adicionado com sucesso! 📚' : 'Livro atualizado com sucesso! ✏️');
            fecharModal();
            loadLivros();
        } else {
            alert(`Erro ao salvar livro:\n${resposta.error || resposta.message || `Erro HTTP ${res.status}`}`);
        }
    } catch (error) {
        alert('Erro ao salvar livro: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = btnText;
    }
}

function deletarLivro(id) {
    if (confirm('Tem certeza que deseja deletar este livro?')) {
        fetch(`/api/livros/${id}`, { method: 'DELETE' })
            .then(r => { if (r.ok) { alert('Livro deletado com sucesso'); loadLivros(); } })
            .catch(() => alert('Erro ao deletar livro'));
    }
}
