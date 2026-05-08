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
            loadCatalogo(); // Atualizar catálogo para mostrar as novas estrelas
        } else {
            const data = await res.json();
            alert('Erro: ' + data.error);
        }
    } catch (e) {
        console.error('Erro ao enviar avaliação:', e);
    }
}
