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
    fecharModalDetalhes(); // Fechar o modal de detalhes
}

function fecharLeitor() {
    // Tentar salvar progresso rápido antes de sair se o user já tiver definido uma página
    document.getElementById('modalLeitor').classList.remove('active');
    document.getElementById('pdfViewer').src = '';
    livroSendoLido = null;
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
