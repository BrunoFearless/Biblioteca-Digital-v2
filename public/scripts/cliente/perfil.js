let readingChart = null;

async function loadPerfil() {
    try {
        const emprestimos = await carregarEmprestimosDoServidor();
        
        // Calcular estatísticas
        const totalLidos = emprestimos.filter(e => e.devolvido).length;
        const ativos = emprestimos.filter(e => !e.devolvido).length;
        
        document.getElementById('statTotalLidos').textContent = totalLidos;
        document.getElementById('statEmprestimosAtivos').textContent = ativos;
        
        renderizarGrafico(emprestimos);
    } catch (e) {
        console.error('Erro ao carregar perfil:', e);
    }
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
