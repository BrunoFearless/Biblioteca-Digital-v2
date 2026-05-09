import { createConnection } from "../db.js";
import { HttpError } from "../utils/httpError.js";

export async function listarAvaliacoes(livro_id) {
  const connection = await createConnection();
  const [rows] = await connection.execute(
    `SELECT a.*, u.nome as usuario_nome FROM avaliacoes a
     JOIN usuarios u ON a.usuario_id = u.id
     WHERE a.livro_id = ?
     ORDER BY a.data_avaliacao DESC`,
    [livro_id]
  );
  return rows;
}

export async function obterAvaliacoesMedias() {
    const connection = await createConnection();
    const [rows] = await connection.execute(
      `SELECT livro_id, AVG(nota) as media, COUNT(*) as total_avaliacoes
       FROM avaliacoes
       GROUP BY livro_id`
    );
    return rows;
}

export async function avaliarLivro(usuario_id, livro_id, nota, comentario) {
  if (nota < 1 || nota > 5) {
      throw new HttpError("A nota deve estar entre 1 e 5.", 400);
  }

  const connection = await createConnection();
  // Verificar se o livro existe
  const [livro] = await connection.execute("SELECT id FROM livros WHERE id = ?", [livro_id]);
  if (livro.length === 0) {
    throw new HttpError("Livro não encontrado", 404);
  }

  // Permite atualizar a avaliação se já existir usando ON DUPLICATE KEY UPDATE
    await connection.execute(
    `INSERT INTO avaliacoes (usuario_id, livro_id, nota, comentario)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE nota = VALUES(nota), comentario = VALUES(comentario), data_avaliacao = CURRENT_TIMESTAMP`,
    [usuario_id, livro_id, nota, comentario || null]
  );
}

export async function listarAtividadeRecente() {
    const connection = await createConnection();
    const [rows] = await connection.execute(
      `SELECT a.*, u.nome as usuario_nome, l.titulo as livro_titulo, l.id as livro_id
       FROM avaliacoes a
       JOIN usuarios u ON a.usuario_id = u.id
       JOIN livros l ON a.livro_id = l.id
       ORDER BY a.data_avaliacao DESC
       LIMIT 5`
    );
    return rows;
}

export async function obterRankingLeitores() {
    const connection = await createConnection();
    try {
        // Consulta robusta que conta apenas empréstimos devolvidos
        const [rows] = await connection.execute(
          `SELECT u.nome, COUNT(e.id) as livros_lidos
           FROM usuarios u
           INNER JOIN emprestimos e ON u.id = e.usuario_id
           WHERE e.devolvido = 1
           GROUP BY u.id, u.nome
           ORDER BY livros_lidos DESC
           LIMIT 3`
        );
        console.log("RANKING CALCULADO:", rows); // Log para vermos no terminal
        return rows;
    } catch (e) {
        console.error("ERRO CRITICO SQL RANKING:", e);
        return [];
    }
}
