async function updateRightPanel() {
    updateCurrentReading();
    updateSchedule();
    updateActivityFeed();
    updateTopLeitores();
}

function updateCurrentReading() {
    const section = document.getElementById('currentReadingSection');
    // Pega o empréstimo ativo mais recente
    const ativo = emprestimosLocal.filter(e => !e.devolvido).sort((a,b) => new Date(b.data_emprestimo) - new Date(a.data_emprestimo))[0];

    if (!ativo) {
        section.innerHTML = '<div class="empty-reading">Escolha um livro no catálogo para começar a ler!</div>';
        return;
    }

    // Como o emprestimo tem livro_id, precisamos do objeto livro para o título
    fetch('/api/livros').then(r => r.json()).then(livros => {
        const livro = livros.find(l => l.id === ativo.livro_id);
        if (livro) {
            section.innerHTML = `
                <h2>${livro.titulo}</h2>
                <div class="reading-progress">
                    Lido recentemente
                </div>
                <p class="reading-desc">${livro.descricao || 'Sem descrição disponível.'}</p>
                <div class="reading-author">- ${livro.autor}</div>
            `;
        }
    });
}

function updateSchedule() {
    const strip = document.getElementById('calendarStrip');
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const hoje = new Date();
    
    // Datas de devolução para destacar
    const datasDevolucao = emprestimosLocal.filter(e => !e.devolvido).map(e => new Date(e.data_devolucao).toDateString());

    let html = '';
    for (let i = -1; i < 4; i++) {
        const d = new Date();
        d.setDate(hoje.getDate() + i);
        const isToday = i === 0;
        const hasReturn = datasDevolucao.includes(d.toDateString());
        
        html += `
            <div class="cal-day ${isToday ? 'active' : ''} ${hasReturn ? 'has-return' : ''}">
                <span>${dias[d.getDay()]}</span>
                <strong>${d.getDate()}</strong>
                ${hasReturn ? '<div class="return-dot"></div>' : ''}
            </div>
        `;
    }
    strip.innerHTML = html;
}

async function updateActivityFeed() {
    const container = document.getElementById('friendsActivity');
    try {
        const atividade = await fetch('/api/avaliacoes/recente').then(r => r.json());
        
        if (atividade.length === 0) {
            container.innerHTML = '<p style="font-size: 12px; color: var(--text-secondary);">Ainda não há avaliações na biblioteca.</p>';
            return;
        }

        container.innerHTML = atividade.map(a => `
            <div class="friend-item">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(a.usuario_nome)}&background=random&color=fff" alt="${a.usuario_nome}" onclick="abrirPerfilPublico(${a.usuario_id})" style="cursor: pointer;">
                <div class="friend-info">
                    <strong onclick="abrirPerfilPublico(${a.usuario_id})" style="cursor: pointer;">${a.usuario_nome}</strong>
                    <p onclick="abrirModalDetalhes(${a.livro_id})" style="cursor: pointer;">Avaliou <i>"${a.livro_titulo}"</i></p>
                    <div class="friend-activity">
                        ${'★'.repeat(a.nota)}${'☆'.repeat(5-a.nota)} 
                        <span class="time">${new Date(a.data_avaliacao).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

async function updateTopLeitores() {
    const container = document.getElementById('topLeitores');
    try {
        const ranking = await fetch('/api/avaliacoes/ranking').then(r => r.json());
        
        container.innerHTML = ranking.map((r, index) => `
            <div class="reader-badge" onclick="abrirPerfilPublico(${r.id})" style="cursor: pointer;">
                <span class="reader-rank">#${index + 1}</span>
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(r.nome)}&background=random&color=fff" style="width: 28px; height: 28px; border-radius: 50%;">
                <span class="reader-name">${r.nome}</span>
                <span class="reader-count">${r.livros_lidos} lidos</span>
            </div>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}
