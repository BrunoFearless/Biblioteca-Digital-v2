let readingChart = null;

async function loadPerfil() {
    const containerAtuais = document.getElementById('minhasLeiturasAtuais');
    const containerLidos = document.getElementById('meuHistoricoLidos');

    try {
        const user = JSON.parse(sessionStorage.getItem('usuario'));
        if (!user) return;

        // Preencher dados básicos
        document.getElementById('profilePageName').textContent = user.nome;
        document.getElementById('profilePageEmail').textContent = user.email;
        document.getElementById('profilePageAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=random&color=fff`;

        // Buscar dados diretamente
        const response = await fetch(`/api/emprestimos/usuario/${user.id}`);
        if (!response.ok) throw new Error('Erro na resposta do servidor');
        
        const emprestimos = await response.json();
        
        // 1. Renderizar Leituras Atuais (Limite de 3 com botão Ver Todos)
        const atuais = emprestimos.filter(e => !e.devolvido);
        const btnAtuaisId = 'containerBtnVerTodosAtuais';
        
        const oldBtnAtuais = document.getElementById(btnAtuaisId);
        if (oldBtnAtuais) oldBtnAtuais.remove();

        if (atuais.length > 0) {
            window.atuaisCompleto = atuais;
            window.atuaisExpandido = false;
            
            renderizarListaAtuais(atuais.slice(0, 3));
            
            if (atuais.length > 3) {
                const btnContainer = document.createElement('div');
                btnContainer.id = btnAtuaisId;
                btnContainer.style.textAlign = 'center';
                btnContainer.style.marginTop = '15px';
                btnContainer.innerHTML = `
                    <button onclick="alternarVerTodosAtuais()" style="background: none; border: 1px solid #ddd; padding: 8px 20px; border-radius: 20px; cursor: pointer; font-size: 0.8rem; color: var(--text-secondary);">
                        Ver Todas (${atuais.length})
                    </button>`;
                containerAtuais.after(btnContainer);
            }
        } else {
            containerAtuais.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">Nenhuma leitura ativa de momento.</p>';
        }

        // 2. Renderizar Lidos (Limite de 3 com botão Ver Todos)
        const lidos = emprestimos.filter(e => e.devolvido);
        const btnId = 'containerBtnVerTodos';
        
        // Limpar botão anterior se existir
        const oldBtn = document.getElementById(btnId);
        if (oldBtn) oldBtn.remove();

        if (lidos.length > 0) {
            window.historicoCompleto = lidos;
            window.historicoExpandido = false;
            
            renderizarListaLidos(lidos.slice(0, 3));
            
            if (lidos.length > 3) {
                const btnContainer = document.createElement('div');
                btnContainer.id = btnId;
                btnContainer.style.textAlign = 'center';
                btnContainer.style.marginTop = '15px';
                btnContainer.innerHTML = `
                    <button onclick="alternarVerTodosLidos()" style="background: none; border: 1px solid #ddd; padding: 8px 20px; border-radius: 20px; cursor: pointer; font-size: 0.8rem; color: var(--text-secondary);">
                        Ver Todos (${lidos.length})
                    </button>`;
                containerLidos.after(btnContainer);
            }
        } else {
            containerLidos.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">Ainda não terminaste nenhum livro.</p>';
        }

        if (document.getElementById('readingChart')) {
            renderizarGrafico(emprestimos);
        }

        // 3. Carregar Minhas Críticas
        const resCriticas = await fetch(`/api/avaliacoes/usuario/${user.id}`);
        const criticas = await resCriticas.json();
        const containerCriticas = document.getElementById('minhasCriticasLista');
        const btnCriticasId = 'containerBtnVerTodasCriticas';

        const oldBtnCriticas = document.getElementById(btnCriticasId);
        if (oldBtnCriticas) oldBtnCriticas.remove();

        if (criticas.length > 0) {
            window.criticasCompleto = criticas;
            window.criticasExpandido = false;
            
            renderizarListaCriticas(criticas.slice(0, 1)); // Limite de 1 conforme solicitado
            
            if (criticas.length > 1) {
                const btnContainer = document.createElement('div');
                btnContainer.id = btnCriticasId;
                btnContainer.style.textAlign = 'center';
                btnContainer.style.marginTop = '10px';
                btnContainer.innerHTML = `
                    <button onclick="alternarVerTodasCriticas()" style="background: none; border: 1px solid #ddd; padding: 5px 15px; border-radius: 20px; cursor: pointer; font-size: 0.75rem; color: var(--text-secondary);">
                        Ver Mais (${criticas.length - 1})
                    </button>`;
                containerCriticas.after(btnContainer);
            }
        } else {
            containerCriticas.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">Ainda não escreveste nenhuma crítica.</p>';
        }

        // 4. Carregar Meus Livros Publicados
        const resPublicados = await fetch(`/api/livros/usuario/${user.id}?t=${Date.now()}`);
        const publicados = await resPublicados.json();
        console.log('Meus livros carregados (sem cache):', publicados);
        window.meusLivrosCompleto = publicados; // Guardar para edição
        const containerPublicados = document.getElementById('meusLivrosPublicados');
        
        if (publicados.length > 0) {
            containerPublicados.innerHTML = publicados.map(p => {
                const statusNormalizado = (p.status || 'pendente').toLowerCase();
                let statusColor = '#ff9800'; // Pendente
                let statusBg = '#fff4e5';
                let actionButtons = `
                    <button onclick="cancelarPublicacao(${p.id})" style="margin-top: 10px; background: none; border: 1px solid #ffcccc; color: #d64b4b; padding: 5px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%;">
                        <i class="ph ph-trash"></i> Cancelar
                    </button>
                `;

                if (statusNormalizado === 'aprovado' || statusNormalizado === 'publico') {
                    statusColor = '#4caf50';
                    statusBg = '#e8f5e9';
                    actionButtons = `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
                            <button onclick="editarMinhaPublicacao(${p.id})" style="background: none; border: 1px solid #9b59b6; color: #9b59b6; padding: 5px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 4px;">
                                <i class="ph ph-pencil-simple"></i> Editar
                            </button>
                            <button onclick="cancelarPublicacao(${p.id})" style="background: none; border: 1px solid #ffcccc; color: #d64b4b; padding: 5px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 4px;">
                                <i class="ph ph-trash"></i> Eliminar
                            </button>
                        </div>
                    `;
                } else if (statusNormalizado === 'rejeitado') {
                    statusColor = '#f44336';
                    statusBg = '#ffebee';
                    actionButtons = `
                        <button onclick="cancelarPublicacao(${p.id})" style="margin-top: 10px; background: #f44336; border: none; color: white; padding: 6px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%;">
                            <i class="ph ph-trash"></i> Apagar e Limpar
                        </button>
                    `;
                }

                return `
                    <div class="profile-book-mini-card" style="background: white; padding: 15px; border-radius: 12px; border: 1px solid #f0f0f0; position: relative; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.3s ease;">
                        <span style="position: absolute; top: 10px; right: 10px; font-size: 0.65rem; padding: 2px 8px; border-radius: 20px; font-weight: 700; text-transform: uppercase; 
                            background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor}44;">
                            ${statusNormalizado}
                        </span>
                        <div style="margin-top: 12px;">
                            <h4 style="font-size: 0.9rem; margin-bottom: 5px; height: 2.4rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${p.titulo}</h4>
                            <p style="font-size: 0.75rem; color: var(--text-secondary);">${p.autor}</p>
                        </div>
                        ${actionButtons}
                    </div>
                `;
            }).join('');
        } else {
            containerPublicados.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">Ainda não publicaste nenhuma obra.</p>';
        }
    } catch (e) {
        console.error('Erro ao carregar perfil:', e);
        if (containerAtuais) containerAtuais.innerHTML = '<p style="color: #d64b4b;">Erro ao carregar dados.</p>';
        if (containerLidos) containerLidos.innerHTML = '<p style="color: #d64b4b;">Erro ao carregar dados.</p>';
    }
}

function renderizarListaAtuais(lista) {
    const container = document.getElementById('minhasLeiturasAtuais');
    if (!container) return;
    container.innerHTML = lista.map(l => `
        <div class="profile-book-mini-card" style="background: white; padding: 15px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.02); border: 1px solid #f0f0f0;">
            <h4 style="font-size: 0.9rem; margin-bottom: 10px; height: 2.4rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${l.titulo || 'Livro sem título'}</h4>
            <button class="btn-action" onclick="abrirLeitor(${l.livro_id})" style="width: 100%; font-size: 0.75rem; background: var(--accent); color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer;">Continuar Lendo</button>
        </div>
    `).join('');
}

function alternarVerTodosAtuais() {
    window.atuaisExpandido = !window.atuaisExpandido;
    const btn = document.querySelector('#containerBtnVerTodosAtuais button');
    
    if (window.atuaisExpandido) {
        renderizarListaAtuais(window.atuaisCompleto);
        btn.textContent = 'Ver Menos';
    } else {
        renderizarListaAtuais(window.atuaisCompleto.slice(0, 3));
        btn.textContent = `Ver Todas (${window.atuaisCompleto.length})`;
    }
}

function renderizarListaLidos(lista) {
    const container = document.getElementById('meuHistoricoLidos');
    if (!container) return;
    container.innerHTML = lista.map(l => `
        <div class="profile-book-mini-card" style="background: #fcfcfc; padding: 15px; border-radius: 12px; border: 1px solid #f0f0f0; opacity: 0.8;">
            <h4 style="font-size: 0.9rem; margin-bottom: 5px;">${l.titulo || 'Livro sem título'}</h4>
            <span style="font-size: 0.75rem; color: #27ae60; font-weight: 600;"><i class="ph ph-check"></i> Concluído</span>
        </div>
    `).join('');
}

function alternarVerTodosLidos() {
    window.historicoExpandido = !window.historicoExpandido;
    const btn = document.querySelector('#containerBtnVerTodos button');
    
    if (window.historicoExpandido) {
        renderizarListaLidos(window.historicoCompleto);
        btn.textContent = 'Ver Menos';
    } else {
        renderizarListaLidos(window.historicoCompleto.slice(0, 3));
        btn.textContent = `Ver Todos (${window.historicoCompleto.length})`;
    }
}

function renderizarListaCriticas(lista) {
    const container = document.getElementById('minhasCriticasLista');
    if (!container) return;
    container.innerHTML = lista.map(c => `
        <div class="profile-comment-item" style="background: white; padding: 20px; border-radius: 15px; border-left: 4px solid #f39c12; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <h4 style="font-size: 1rem; font-family: var(--font-heading);">${c.titulo_livro || 'Livro'}</h4>
                <div style="color: #f39c12; font-size: 0.85rem;">
                    ${'★'.repeat(c.nota)}${'☆'.repeat(5-c.nota)}
                </div>
            </div>
            <p style="font-size: 0.9rem; color: var(--text-primary); line-height: 1.5; font-style: italic;">"${c.comentario || 'Sem comentário.'}"</p>
        </div>
    `).join('');
}

function alternarVerTodasCriticas() {
    window.criticasExpandido = !window.criticasExpandido;
    const btn = document.querySelector('#containerBtnVerTodasCriticas button');
    
    if (window.criticasExpandido) {
        renderizarListaCriticas(window.criticasCompleto);
        btn.textContent = 'Ver Menos';
    } else {
        renderizarListaCriticas(window.criticasCompleto.slice(0, 1));
        btn.textContent = `Ver Mais (${window.criticasCompleto.length - 1})`;
    }
}

async function cancelarPublicacao(id) {
    const confirmMsg = 'Deseja realmente remover esta publicação? Esta ação não pode ser desfeita.';
    if (!confirm(confirmMsg)) return;

    try {
        const res = await fetch(`/api/livros/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadPerfil(); // Recarregar a lista
        } else {
            alert('Erro ao remover publicação.');
        }
    } catch (error) {
        console.error(error);
        alert('Erro de conexão.');
    }
}

async function editarMinhaPublicacao(id) {
    const livro = window.meusLivrosCompleto.find(l => l.id === id);
    if (!livro) return;

    // Preencher o modal de sugestão com os dados atuais
    document.getElementById('sugestaoTitulo').value = livro.titulo;
    document.getElementById('sugestaoAutor').value = livro.autor;
    document.getElementById('sugestaoCategoria').value = livro.categoria || livro.genero;
    document.getElementById('sugestaoAno').value = livro.ano_publicacao;
    document.getElementById('sugestaoEstoque').value = livro.estoque;
    document.getElementById('sugestaoDescricao').value = livro.descricao;
    
    // Mudar textos para "Editar"
    document.querySelector('#modalSugestao h2').textContent = "Editar Minha Obra";
    document.querySelector('#modalSugestao .btn-confirm-glass').textContent = "Salvar Alterações";
    
    // Guardar o ID para saber que é edição
    window.livroEmEdicaoId = id;
    
    abrirModalSugestao();
}

function renderizarGrafico(emprestimos) {
    const ctx = document.getElementById('readingChart').getContext('2d');
    
    // Agrupar por mês (últimos 6 meses)
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dataAtual = new Date();
    const ultimosMeses = [];
    const contagemPorMes = {};
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - i, 1);
        const label = meses[d.getMonth()];
        ultimosMeses.push(label);
        contagemPorMes[label] = 0;
    }
    
    emprestimos.forEach(e => {
        const d = new Date(e.data_emprestimo);
        const label = meses[d.getMonth()];
        if (contagemPorMes[label] !== undefined) {
            contagemPorMes[label]++;
        }
    });
    
    if (readingChart) {
        readingChart.destroy();
    }
    
    readingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ultimosMeses,
            datasets: [{
                label: 'Livros Requisitados',
                data: ultimosMeses.map(m => contagemPorMes[m]),
                backgroundColor: '#d64b4b',
                borderRadius: 8,
                barThickness: 24
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { top: 10 }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1a1a',
                    padding: 10,
                    bodyFont: { family: 'Inter' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 5, // Define um teto visual inicial para não parecer infinito
                    ticks: { 
                        stepSize: 1,
                        precision: 0,
                        color: '#6e6b66'
                    },
                    grid: { 
                        color: 'rgba(0,0,0,0.05)',
                        drawBorder: false
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#6e6b66' }
                }
            }
        }
    });
}
