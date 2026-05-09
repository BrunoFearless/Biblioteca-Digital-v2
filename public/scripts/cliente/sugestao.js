function abrirModalSugestao() {
    document.getElementById('modalSugestao').classList.add('active');
}

function fecharModalSugestao() {
    document.getElementById('modalSugestao').classList.remove('active');
    document.getElementById('formSugestao').reset();
    if (document.getElementById('nomeFicheiroPdf')) {
        document.getElementById('nomeFicheiroPdf').textContent = '';
    }
}

function atualizarNomeFicheiro(input) {
    const nome = input.files[0] ? input.files[0].name : '';
    if (document.getElementById('nomeFicheiroPdf')) {
        document.getElementById('nomeFicheiroPdf').textContent = nome ? `Selecionado: ${nome}` : '';
    }
}

async function enviarSugestao(event) {
    event.preventDefault();
    
    const userStr = sessionStorage.getItem('usuario');
    if (!userStr) {
        alert('Faça login para sugerir um livro.');
        return;
    }
    const user = JSON.parse(userStr);

    const formData = new FormData();
    formData.append('titulo', document.getElementById('sugestaoTitulo').value);
    formData.append('autor', document.getElementById('sugestaoAutor').value);
    formData.append('categoria', document.getElementById('sugestaoCategoria').value);
    formData.append('ano', document.getElementById('sugestaoAno').value);
    formData.append('estoque', document.getElementById('sugestaoEstoque').value);
    formData.append('descricao', document.getElementById('sugestaoDescricao').value);
    formData.append('capa', document.getElementById('sugestaoCapa').files[0]);
    formData.append('pdf', document.getElementById('sugestaoPdf').files[0]);
    formData.append('usuario_id', user.id);

    try {
        const response = await fetch('/api/livros/sugerir', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            fecharModalSugestao();
            if (typeof showSuccessFeedback === 'function') {
                showSuccessFeedback('Obrigado! A sua obra foi enviada para análise do administrador.');
            } else {
                alert('Obrigado! A sua obra foi enviada para análise do administrador.');
            }
            // Recarregar lista de publicados no perfil se estiver lá
            if (typeof loadPerfil === 'function') loadPerfil();
        } else {
            const err = await response.json();
            alert('Erro ao enviar: ' + (err.error || 'Tente novamente.'));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão com o servidor.');
    }
}
