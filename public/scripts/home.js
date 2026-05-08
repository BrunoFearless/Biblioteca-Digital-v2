function entrarBiblioteca() {
  setTimeout(() => {
    window.location.href = "index.html";
  }, 300);
}

function criarLivrosAnimados() {
  const bg = document.getElementById("animatedBg");
  if (!bg) return;

  const livros = ["📚", "📖", "📕", "📗", "📘", "📙", "📒", "📔", "📓", "📑", "📜", "📄", "📃"];
  const cores = ["", "b2", "b3", "b4"];

  for (let i = 0; i < 34; i += 1) {
    const book = document.createElement("div");
    book.className = `book ${cores[Math.floor(Math.random() * cores.length)]}`;
    book.style.left = `${Math.random() * 96}vw`;
    book.style.top = `${Math.random() * 90}vh`;
    book.style.animationDuration = `${10 + Math.random() * 36}s`;
    book.style.animationDelay = `${Math.random() * 2}s`;
    book.style.animationName = "floatBook";
    book.textContent = livros[Math.floor(Math.random() * livros.length)];
    bg.appendChild(book);
  }
}

window.entrarBiblioteca = entrarBiblioteca;
window.addEventListener("DOMContentLoaded", criarLivrosAnimados);
