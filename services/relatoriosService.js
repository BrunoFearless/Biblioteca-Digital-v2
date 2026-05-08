import { createConnection } from "../db.js";

export async function relatorioEmprestimosPendentes() {
  const connection = await createConnection();
  const [rows] = await connection.execute(`
    SELECT u.nome, u.email, e.data_emprestimo, e.data_devolucao, l.titulo
    FROM emprestimos e
    JOIN usuarios u ON e.usuario_id = u.id
    JOIN livros l ON e.livro_id = l.id
    WHERE e.devolvido = FALSE
  `);
  return rows;
}

export async function relatorioEmprestimosAtivos() {
  const connection = await createConnection();
  const [rows] = await connection.execute(`
    SELECT u.nome, l.titulo, e.data_emprestimo, e.data_devolucao
    FROM emprestimos e
    JOIN usuarios u ON e.usuario_id = u.id
    JOIN livros l ON e.livro_id = l.id
    WHERE e.devolvido = FALSE
  `);
  return rows;
}

export async function relatorioLivrosMaisEmprestados() {
  const connection = await createConnection();
  const [rows] = await connection.execute(`
    SELECT l.titulo, l.autor, l.vezes_emprestado
    FROM livros l
    ORDER BY l.vezes_emprestado DESC
    LIMIT 10
  `);
  return rows;
}
