async function carregarPendentes() {
    const container = document.getElementById('pendentesContent');
    container.innerHTML = '<div class="loading">Buscando sugestões...</div>';

    try {
        const res = await fetch('/api/livros/pendentes');
        const pendentes = await res.json();

        if (pendentes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="ph ph-check-circle" style="font-size: 48px; color: #27ae60;"></i>
                    <p>Não há sugestões pendentes de momento.</p>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; padding: 10px;">
                ${pendentes.map(l => `
                    <div class="glass-card" style="display: flex; flex-direction: column; height: 100%; overflow: hidden; border: 1px solid rgba(0,0,0,0.05); background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                        <div style="height: 200px; overflow: hidden; position: relative; margin: 10px; border-radius: 15px;">
                            <img src="${l.capa_url || '/img/no-cover.jpg'}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 15px;">
                            <span class="badge" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 8px;">${l.categoria}</span>
                        </div>
                        <div style="padding: 15px 20px 20px 20px; flex: 1; display: flex; flex-direction: column;">
                            <h3 style="margin: 0 0 5px 0; font-family: var(--font-heading); font-size: 1.1rem;">${l.titulo}</h3>
                            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 15px;">por ${l.autor}</p>
                            
                            <div style="background: #f8f9fa; padding: 12px; border-radius: 12px; margin-bottom: 20px; flex: 1; border: 1px solid #f0f0f0;">
                                <p style="font-size: 0.8rem; color: #555; line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;">
                                    ${l.descricao || 'Sem descrição fornecida.'}
                                </p>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <button class="btn-success" onclick="moderarObra(${l.id}, 'aprovado')" style="width: 100%; height: 40px; display: flex; align-items: center; justify-content: center; gap: 8px; border-radius: 12px; border: none; cursor: pointer; font-weight: 600;">
                                    <i class="ph ph-check-circle" style="font-size: 1.1rem;"></i> Aprovar
                                </button>
                                <button class="btn-danger" onclick="moderarObra(${l.id}, 'rejeitado')" style="width: 100%; height: 40px; display: flex; align-items: center; justify-content: center; gap: 8px; border-radius: 12px; border: none; cursor: pointer; font-weight: 600;">
                                    <i class="ph ph-x-circle" style="font-size: 1.1rem;"></i> Rejeitar
                                </button>
                            </div>
                            ${l.pdf_url ? `
                                <button onclick="abrirLeitorAdmin('${l.pdf_url}', '${l.titulo}')" class="btn-primary" style="margin-top: 12px; width: 100%; height: 38px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; background: #9b59b6; border-radius: 12px; font-size: 0.85rem; font-weight: 500; color: white;">
                                    <i class="ph ph-eye"></i> Analisar Documento
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<div class="error">Erro ao carregar sugestões.</div>';
    }
}

function abrirLeitorAdmin(url, titulo) {
    document.getElementById('leitorAdminTitulo').textContent = `Analisando: ${titulo}`;
    document.getElementById('pdfViewerAdmin').src = url;
    document.getElementById('modalLeitorAdmin').classList.add('show');
}

function fecharLeitorAdmin() {
    document.getElementById('modalLeitorAdmin').classList.remove('show');
    document.getElementById('pdfViewerAdmin').src = '';
}

async function moderarObra(id, novoStatus) {
    if (!confirm(`Deseja realmente marcar esta obra como ${novoStatus}?`)) return;

    try {
        const res = await fetch(`/api/livros/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });

        if (res.ok) {
            alert(`Obra ${novoStatus} com sucesso!`);
            carregarPendentes();
            if (typeof carregarLivros === 'function') carregarLivros(); // Atualizar catálogo se existir
        } else {
            alert('Erro ao processar moderação.');
        }
    } catch (error) {
        console.error(error);
        alert('Erro de conexão.');
    }
}

// Integrar com o sistema de navegação do Admin
const originalShowSection = window.showSection;
window.showSection = function(id) {
    if (typeof originalShowSection === 'function') originalShowSection(id);
    if (id === 'pendentes') carregarPendentes();
};
