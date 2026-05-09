let currentClubeId = null;
let chatInterval = null;

async function carregarClubes() {
    const container = document.getElementById('clubesLista');
    container.innerHTML = '<div class="loading">Carregando clubes...</div>';
    
    try {
        const response = await fetch('/api/clubes');
        const clubes = await response.json();
        
        const userStr = sessionStorage.getItem('usuario');
        if (!userStr) {
            container.innerHTML = '<div class="error">Acesso ao armazenamento bloqueado ou não autenticado. Por favor, verifique as definições do browser ou faça login novamente.</div>';
            return;
        }
        const user = JSON.parse(userStr);
        
        if (clubes.length === 0) {
            container.innerHTML = '<div class="empty-state">Nenhum clube criado ainda. Seja o primeiro!</div>';
            return;
        }

        container.innerHTML = '';
        for (const clube of clubes) {
            const eMembroResp = await fetch(`/api/clubes/${clube.id}/verificar/${user.id}`);
            const { eMembro } = await eMembroResp.json();

            const isCreator = clube.criador_id === user.id;
            const card = document.createElement('div');
            card.className = 'clube-card';
            
            // Nova Estrutura Premium V2
            card.innerHTML = `
                <div class="clube-card-bg" style="background-image: url('${clube.capa_url || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800'}')"></div>
                <div class="clube-card-overlay"></div>
                
                ${isCreator ? `
                    <div class="clube-admin-actions">
                        <button class="btn-mini-action" onclick="abrirModalEditarClube(${JSON.stringify(clube).replace(/"/g, '&quot;')})" title="Editar"><i class="ph ph-pencil"></i></button>
                        <button class="btn-mini-action delete" onclick="eliminarClube(${clube.id})" title="Eliminar"><i class="ph ph-trash"></i></button>
                    </div>
                ` : ''}

                <div class="clube-content">
                    <h3>${clube.nome}</h3>
                    <p>${clube.descricao || 'Sem descrição disponível.'}</p>
                    <div class="clube-meta">
                        <span><i class="ph ph-users"></i> ${clube.total_membros} membros</span>
                        ${clube.livro_titulo ? `<span><i class="ph ph-book"></i> ${clube.livro_titulo}</span>` : ''}
                    </div>
                    <div class="action-buttons" style="margin-top: 15px;">
                        ${eMembro ? 
                            `<button class="btn-glass-chat" onclick="abrirChatClube(${clube.id})"><i class="ph ph-chat-centered-dots"></i> Entrar no Chat</button>` : 
                            `<button class="btn-primary" style="width:100%; font-size:0.8rem; padding:8px; background:white; color:var(--primary);" onclick="aderirClube(${clube.id})"><i class="ph ph-plus"></i> Aderir ao Clube</button>`
                        }
                    </div>
                </div>
            `;
            container.appendChild(card);
        }
    } catch (error) {
        console.error("Erro ao carregar clubes:", error);
        container.innerHTML = '<div class="error">Erro ao carregar clubes.</div>';
    }
}

async function abrirModalCriarClube() {
    const select = document.getElementById('clubeLivroId');
    select.innerHTML = '<option value="">Nenhum livro selecionado</option>';
    
    try {
        const response = await fetch('/api/livros');
        const livros = await response.json();
        livros.forEach(livro => {
            const opt = document.createElement('option');
            opt.value = livro.id;
            opt.textContent = livro.titulo;
            select.appendChild(opt);
        });
    } catch (error) {
        console.error("Erro ao carregar livros:", error);
    }
    
    document.getElementById('modalCriarClube').classList.add('active');
}

function fecharModalCriarClube() {
    document.getElementById('modalCriarClube').classList.remove('active');
    document.getElementById('formCriarClube').reset();
}

async function criarNovoClube(event) {
    event.preventDefault();
    const user = JSON.parse(sessionStorage.getItem('usuario'));
    
    const formData = new FormData();
    formData.append('nome', document.getElementById('clubeNome').value);
    formData.append('descricao', document.getElementById('clubeDescricao').value);
    formData.append('criador_id', user.id);
    
    const livroId = document.getElementById('clubeLivroId').value;
    if (livroId) formData.append('livro_id', livroId);
    
    const capaFile = document.getElementById('clubeCapaFile').files[0];
    if (capaFile) formData.append('capa', capaFile);

    try {
        const response = await fetch('/api/clubes', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            showToast("Clube criado com sucesso!");
            fecharModalCriarClube();
            carregarClubes();
        }
    } catch (error) {
        console.error("Erro:", error);
    }
}

// Lógica de Edição
async function abrirModalEditarClube(clube) {
    document.getElementById('editClubeId').value = clube.id;
    document.getElementById('editClubeNome').value = clube.nome;
    document.getElementById('editClubeDescricao').value = clube.descricao || '';
    
    const select = document.getElementById('editClubeLivroId');
    select.innerHTML = '<option value="">Nenhum livro selecionado</option>';
    
    try {
        const response = await fetch('/api/livros');
        const livros = await response.json();
        livros.forEach(livro => {
            const opt = document.createElement('option');
            opt.value = livro.id;
            opt.textContent = livro.titulo;
            if (livro.id === clube.livro_id) opt.selected = true;
            select.appendChild(opt);
        });
    } catch (error) { console.error(error); }

    document.getElementById('modalEditarClube').classList.add('active');
}

function fecharModalEditarClube() {
    document.getElementById('modalEditarClube').classList.remove('active');
}

async function confirmarEdicaoClube(event) {
    event.preventDefault();
    const id = document.getElementById('editClubeId').value;
    const user = JSON.parse(sessionStorage.getItem('usuario'));

    const formData = new FormData();
    formData.append('nome', document.getElementById('editClubeNome').value);
    formData.append('descricao', document.getElementById('editClubeDescricao').value);
    
    const livroId = document.getElementById('editClubeLivroId').value;
    if (livroId) formData.append('livro_id', livroId);
    
    const capaFile = document.getElementById('editClubeCapaFile').files[0];
    if (capaFile) formData.append('capa', capaFile);

    try {
        const response = await fetch(`/api/clubes/${id}`, {
            method: 'PUT',
            body: formData
        });

        if (response.ok) {
            showToast("Clube atualizado!");
            fecharModalEditarClube();
            carregarClubes();
        }
    } catch (error) { console.error(error); }
}

async function eliminarClube(id) {
    if (!confirm("Tens a certeza que desejas eliminar este clube? Todas as mensagens serão perdidas.")) return;
    
    try {
        const response = await fetch(`/api/clubes/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showToast("Clube eliminado com sucesso.");
            carregarClubes();
        }
    } catch (error) { console.error(error); }
}

async function aderirClube(id) {
    const user = JSON.parse(sessionStorage.getItem('usuario'));
    try {
        const response = await fetch(`/api/clubes/${id}/aderir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: user.id })
        });

        if (response.ok) {
            showToast("Agora fazes parte deste clube!");
            carregarClubes();
        }
    } catch (error) {
        console.error("Erro ao aderir:", error);
    }
}

async function abrirChatClube(id) {
    currentClubeId = id;
    const modal = document.getElementById('modalClubeChat');
    const user = JSON.parse(sessionStorage.getItem('usuario'));
    
    try {
        const respClube = await fetch(`/api/clubes/${id}`);
        const clube = await respClube.json();
        
        document.getElementById('chatClubeNome').textContent = clube.nome;
        document.getElementById('chatClubeLivro').textContent = clube.livro_titulo ? `A ler: ${clube.livro_titulo}` : 'Nenhum livro definido';
        
        // Configurar Meta
        if (clube.meta_leitura) {
            document.getElementById('metaProgressoContainer').style.display = 'flex';
            const meta = parseInt(clube.meta_leitura);
            document.getElementById('metaDesc').textContent = `Meta: Pág ${meta}`;
        } else {
            document.getElementById('metaProgressoContainer').style.display = 'none';
        }

        // Mostrar botão de config meta se for o criador
        document.getElementById('btnConfigMeta').style.display = (clube.criador_id === user.id) ? 'block' : 'none';

        modal.classList.add('active');
        atualizarMembrosClube(id);
        carregarMensagens();
        carregarCitacoes();
        carregarVotos();
        
        if (chatInterval) clearInterval(chatInterval);
        chatInterval = setInterval(() => {
            carregarMensagens();
            atualizarMembrosClube(id);
            carregarVotos();
        }, 5000); 
        
    } catch (error) {
        console.error("Erro ao abrir chat:", error);
    }
}

function fecharModalClubeChat() {
    document.getElementById('modalClubeChat').classList.remove('active');
    clearInterval(chatInterval);
    chatInterval = null;
    currentClubeId = null;
}

async function carregarMensagens() {
    if (!currentClubeId) return;
    
    const user = JSON.parse(sessionStorage.getItem('usuario'));
    const container = document.getElementById('chatMensagens');
    
    try {
        const response = await fetch(`/api/clubes/${currentClubeId}/mensagens`);
        const mensagens = await response.json();
        
        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;

        container.innerHTML = '';
        mensagens.forEach(msg => {
            const isMe = msg.usuario_id === user.id;
            const bubble = document.createElement('div');
            bubble.className = `chat-bubble ${isMe ? 'sent' : 'received'}`;
            bubble.id = `msg-${msg.id}`; // Adicionar ID para manipulação
            
            let actionsHtml = '';
            if (isMe) {
                const escapedMsg = msg.mensagem.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                actionsHtml = `
                    <div class="chat-actions">
                        <button class="chat-action-btn" onclick="iniciarEdicaoMensagem(${msg.id}, '${escapedMsg}')" title="Editar"><i class="ph ph-pencil-simple"></i></button>
                        <button class="chat-action-btn delete" onclick="eliminarMensagemChat(${msg.id})" title="Eliminar"><i class="ph ph-trash"></i></button>
                    </div>
                `;
            }

            bubble.innerHTML = `
                ${actionsHtml}
                ${!isMe ? `<strong style="display:block;font-size:0.7rem;margin-bottom:4px;opacity:0.8;">${msg.usuario_nome}</strong>` : ''}
                <div class="msg-text">${msg.mensagem}</div>
                ${msg.foi_editada ? '<span class="edited-label">(editada)</span>' : ''}
            `;
            
            const meta = document.createElement('div');
            meta.className = `chat-meta ${isMe ? 'sent' : ''}`;
            meta.textContent = new Date(msg.data_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            container.appendChild(bubble);
            container.appendChild(meta);
        });

        if (isAtBottom) {
            container.scrollTop = container.scrollHeight;
        }
    } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
    }
}

function iniciarEdicaoMensagem(id, texto) {
    const bubble = document.getElementById(`msg-${id}`);
    const textDiv = bubble.querySelector('.msg-text');
    const actions = bubble.querySelector('.chat-actions');
    
    // Esconder ações originais
    if (actions) actions.style.display = 'none';
    
    // Criar container de edição
    textDiv.innerHTML = `
        <div class="edit-msg-container">
            <input type="text" class="edit-msg-input" value="${texto}" id="input-edit-${id}" onkeyup="if(event.key === 'Enter') salvarEdicaoMensagem(${id})">
            <div class="edit-msg-actions">
                <button class="btn-edit-cancel" onclick="carregarMensagens()">Cancelar</button>
                <button class="btn-edit-save" onclick="salvarEdicaoMensagem(${id})">Guardar</button>
            </div>
        </div>
    `;
    
    const input = document.getElementById(`input-edit-${id}`);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
}

async function salvarEdicaoMensagem(id) {
    const novoTexto = document.getElementById(`input-edit-${id}`).value.trim();
    if (!novoTexto) return;
    
    await editarMensagemChat(id, novoTexto);
}

async function editarMensagemChat(id, mensagem) {
    try {
        const response = await fetch(`/api/clubes/mensagens/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensagem })
        });
        if (response.ok) carregarMensagens();
    } catch (error) { console.error(error); }
}

async function eliminarMensagemChat(id) {
    if (!confirm("Deseja eliminar esta mensagem?")) return;
    try {
        const response = await fetch(`/api/clubes/mensagens/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) carregarMensagens();
    } catch (error) { console.error(error); }
}

async function enviarMensagemClube() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg || !currentClubeId) return;

    const user = JSON.parse(sessionStorage.getItem('usuario'));
    
    try {
        await fetch(`/api/clubes/${currentClubeId}/mensagens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: user.id, mensagem: msg })
        });
        input.value = '';
        carregarMensagens();
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
    }
}

async function atualizarMembrosClube(id) {
    const container = document.getElementById('clubeMembrosLista');
    const user = JSON.parse(sessionStorage.getItem('usuario'));

    try {
        const respClube = await fetch(`/api/clubes/${id}`);
        const clube = await respClube.json();
        const metaPagina = clube.meta_leitura ? parseInt(clube.meta_leitura) : 0;

        const response = await fetch(`/api/clubes/${id}/membros`);
        const todosMembros = await response.json();
        const membros = todosMembros.slice(0, 3);
        
        container.innerHTML = '';
        membros.forEach(m => {
            const div = document.createElement('div');
            div.className = 'membro-item';
            div.style.cursor = 'pointer';
            div.onclick = () => abrirPerfilPublico(m.id);

            // Calcular progresso relativo à meta
            let progressHtml = '';
            if (metaPagina > 0) {
                const perc = Math.min(Math.round((m.pagina_atual / metaPagina) * 100), 100);
                progressHtml = `<span class="member-progress">${perc}%</span>`;
            } else {
                progressHtml = `<span class="member-progress" style="color:#aaa;">Pág ${m.pagina_atual}</span>`;
            }

            // Botão de expulsar (apenas se eu for o admin e o membro não for eu)
            const isMe = m.id === user.id;
            const isAdmin = clube.criador_id === user.id;
            const kickBtn = (isAdmin && !isMe) 
                ? `<button class="btn-kick" onclick="event.stopPropagation(); expulsarMembro(${m.id}, '${m.nome}')" title="Expulsar membro" style="background: none; border: none; color: #ff4757; cursor: pointer; padding: 5px; font-size: 1rem;"><i class="ph ph-user-minus"></i></button>` 
                : '';

            div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                    <div class="membro-avatar">${m.nome.charAt(0)}</div>
                    <span style="font-size: 0.85rem;">${m.nome}</span>
                    ${progressHtml}
                </div>
                ${kickBtn}
            `;
            container.appendChild(div);

            // Se for o meu próprio progresso...
            if (m.id === user.id) {
                // Só atualiza se o input não estiver focado para não atrapalhar a digitação
                if (document.activeElement !== document.getElementById('inputPaginaAtual')) {
                    document.getElementById('inputPaginaAtual').value = m.pagina_atual;
                }
                
                // Atualizar barra global no topo se houver meta
                if (metaPagina > 0) {
                    const percGlobal = Math.min(Math.round((m.pagina_atual / metaPagina) * 100), 100);
                    document.getElementById('metaProgressoFill').style.width = `${percGlobal}%`;
                    document.getElementById('metaDesc').textContent = `${percGlobal}% da Meta`;
                }
            }
        });
    } catch (error) {
        console.error("Erro ao listar membros:", error);
    }
}

async function atualizarMeuProgresso() {
    const pagina = document.getElementById('inputPaginaAtual').value;
    const user = JSON.parse(sessionStorage.getItem('usuario'));
    
    try {
        await fetch(`/api/clubes/${currentClubeId}/progresso`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: user.id, pagina: parseInt(pagina) })
        });
        // Não chamamos atualizarMembrosClube aqui para evitar loops de foco, o polling trata disso
    } catch (error) { console.error(error); }
}

async function configurarMeta() {
    const novaMeta = prompt("Defina a página meta para o clube (ex: 150):");
    if (novaMeta) {
        await fetch(`/api/clubes/${currentClubeId}/meta`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meta: novaMeta })
        });
        abrirChatClube(currentClubeId);
    }
}

async function adicionarNovaCitacao() {
    const texto = prompt("Partilhe uma citação do livro:");
    if (!texto) return;
    
    const user = JSON.parse(sessionStorage.getItem('usuario'));
    try {
        await fetch(`/api/clubes/${currentClubeId}/citacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: user.id, texto })
        });
        carregarCitacoes();
    } catch (error) { console.error(error); }
}

async function carregarCitacoes() {
    if (!currentClubeId) return;
    const container = document.getElementById('clubeCitacoesLista');
    try {
        const response = await fetch(`/api/clubes/${currentClubeId}/citacoes`);
        const todasCitacoes = await response.json();
        const citacoes = todasCitacoes.slice(0, 3);
        
        container.innerHTML = citacoes.map(c => `
            <div class="citacao-item">
                "${c.texto}"
                <span class="citacao-author">Enviada por ${c.usuario_nome}</span>
            </div>
        `).join('');
    } catch (error) { console.error(error); }
}

async function abrirModalVotacao() {
    const resp = await fetch('/api/livros');
    const livros = await resp.json();
    
    const titulo = prompt("Em que livro deseja votar para a próxima leitura? (Escreva parte do título)");
    if (!titulo) return;
    
    const livro = livros.find(l => l.titulo.toLowerCase().includes(titulo.toLowerCase()));
    if (livro) {
        const user = JSON.parse(sessionStorage.getItem('usuario'));
        await fetch(`/api/clubes/${currentClubeId}/votos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: user.id, livro_id: livro.id })
        });
        showToast(`Votaste em: ${livro.titulo}`);
        carregarVotos();
    } else {
        alert("Livro não encontrado no catálogo.");
    }
}

async function carregarVotos() {
    if (!currentClubeId) return;
    const container = document.getElementById('clubeVotosLista');
    try {
        const response = await fetch(`/api/clubes/${currentClubeId}/votos`);
        const todosVotos = await response.json();
        const votos = todosVotos.slice(0, 3);
        
        container.innerHTML = votos.map(v => `
            <div class="voto-item">
                <span>${v.livro_titulo}</span>
                <span class="voto-count">${v.total}</span>
            </div>
        `).join('');
    } catch (error) { console.error(error); }
}

async function abandonarClube() {
    if (!currentClubeId) return;
    if (!confirm("Tem certeza que deseja sair deste clube?")) return;
    
    const user = JSON.parse(sessionStorage.getItem('usuario'));
    try {
        const response = await fetch(`/api/clubes/${currentClubeId}/membro`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: user.id })
        });

        if (response.ok) {
            showToast("Saíste do clube.");
            fecharModalClubeChat();
            carregarClubes();
        }
    } catch (error) {
        console.error("Erro ao sair:", error);
    }
}

// Integrar com showSection do navigation.js (handled externally)

async function expulsarMembro(usuarioId, nome) { if (!confirm(" Tem certeza que deseja expulsar \ + nome + \?\)) return; const user = JSON.parse(sessionStorage.getItem(\usuario\)); try { const response = await fetch(\/api/clubes/\ + currentClubeId + \/membros/\ + usuarioId, { method: \DELETE\, headers: { \Content-Type\: \application/json\ }, body: JSON.stringify({ admin_id: user.id }) }); if (response.ok) { showToast(nome + " foi expulso do clube.\); atualizarMembrosClube(currentClubeId); } else { const err = await response.json(); alert(err.error || \Erro ao expulsar membro\); } } catch (error) { console.error(error); } }
