// Lógica de Dark Mode
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Carregar preferência
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.querySelector('i').classList.replace('ph-moon', 'ph-sun');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Mudar ícone
    const icon = themeToggle.querySelector('i');
    if (isDark) {
        icon.classList.replace('ph-moon', 'ph-sun');
    } else {
        icon.classList.replace('ph-sun', 'ph-moon');
    }
});

// Lógica de Feedback (Toast)
function showToast(message) {
    const toast = document.getElementById('toastSuccess');
    const msgSpan = document.getElementById('toastMessage');
    
    msgSpan.textContent = message;
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// Sobrescrever funções globais para usar o toast em vez de alert
const originalAlert = window.alert;
window.showSuccessFeedback = showToast; // Nova função global
