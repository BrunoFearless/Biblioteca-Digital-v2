let livroSendoLido = null;

async function abrirLeitor(livroId) {
    const livro = livrosLocal.find(l => l.id === livroId);
    if (!livro || !livro.pdf_url) {
        showSuccessFeedback('Este livro ainda não tem uma versão digital disponível.');
        return;
    }

    livroSendoLido = livroId;
    document.getElementById('leitorTitulo').textContent = livro.titulo;
    
    // Carregar progresso anterior
    try {
        const progresso = await fetch(`/api/leitura/progresso/${livroId}?usuario_id=${usuarioAtual.id}`).then(r => r.json());
        if (progresso && progresso.ultima_pagina) {
            document.getElementById('leitorProgresso').textContent = `Continua na Página ${progresso.ultima_pagina}`;
            // Se o PDF viewer suportar ancoragem por página:
            document.getElementById('pdfViewer').src = `${livro.pdf_url}#page=${progresso.ultima_pagina}`;
        } else {
            document.getElementById('leitorProgresso').textContent = `Iniciando leitura`;
            document.getElementById('pdfViewer').src = livro.pdf_url;
        }
    } catch (e) {
        document.getElementById('pdfViewer').src = livro.pdf_url;
    }

    document.getElementById('modalLeitor').classList.add('active');
    
    // Limpar chat e preparar para o novo livro
    document.getElementById('aiChatMessages').innerHTML = `
        <div class="ai-bubble system">
            Estou a analisar o conteúdo de "${livro.titulo}" para te ajudar. O que gostarias de saber?
        </div>`;

    fecharModalDetalhes(); // Fechar o modal de detalhes
}

function fecharLeitor() {
    // Tentar salvar progresso rápido antes de sair se o user já tiver definido uma página
    document.getElementById('modalLeitor').classList.remove('active');
    document.getElementById('pdfViewer').src = '';
    livroSendoLido = null;
    
    // Resetar o chat para não mostrar restos da conversa anterior ao abrir outro livro
    document.getElementById('aiChatMessages').innerHTML = '';
}

async function salvarProgressoLeitura() {
    if (!livroSendoLido) return;
    
    const pagina = prompt("Em que página paraste a leitura?", "1");
    if (!pagina || isNaN(pagina)) return;

    try {
        const res = await fetch('/api/leitura/progresso', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: usuarioAtual.id,
                livro_id: livroSendoLido,
                ultima_pagina: parseInt(pagina)
            })
        });
        if (res.ok) {
            showSuccessFeedback(`✅ Progresso guardado na página ${pagina}!`);
            document.getElementById('leitorProgresso').textContent = `Página ${pagina}`;
        }
    } catch (e) {
        console.error(e);
    }
}

// Lógica da IA
async function enviarMensagemIA() {
    const input = document.getElementById('aiInput');
    const msg = input.value.trim();
    if (!msg || !livroSendoLido) return;

    const container = document.getElementById('aiChatMessages');
    const livro = livrosLocal.find(l => l.id === livroSendoLido);

    // Adicionar mensagem do user
    container.innerHTML += `<div class="ai-bubble user">${msg}</div>`;
    input.value = '';
    container.scrollTop = container.scrollHeight;

    // Bolha de "digitando"
    const typingId = 'typing-' + Date.now();
    container.innerHTML += `<div id="${typingId}" class="ai-bubble system"><i>O assistente está a analisar...</i></div>`;
    container.scrollTop = container.scrollHeight;

    try {
        const res = await fetch('/api/ia/perguntar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pergunta: msg,
                livroContexto: livro
            })
        });
        const data = await res.json();
        
        // Remover bolha de digitando e adicionar resposta
        document.getElementById(typingId).remove();
        container.innerHTML += `<div class="ai-bubble system">${data.resposta}</div>`;
        container.scrollTop = container.scrollHeight;
    } catch (e) {
        document.getElementById(typingId).innerHTML = 'Erro ao contactar o assistente.';
    }
}
