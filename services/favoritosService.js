import { createConnection } from "../db.js";
import { HttpError } from "../utils/httpError.js";

export async function listarFavoritos(usuario_id) {
  const connection = await createConnection();
  const [rows] = await connection.execute(
    `SELECT l.* FROM favoritos f
     JOIN livros l ON f.livro_id = l.id
     WHERE f.usuario_id = ?`,
    [usuario_id]
  );
  return rows;
}

export async function listarFavoritosIds(usuario_id) {
    const connection = await createConnection();
    const [rows] = await connection.execute(
      `SELECT livro_id FROM favoritos WHERE usuario_id = ?`,
      [usuario_id]
    );
    return rows.map(r => r.livro_id);
}

export async function adicionarFavorito(usuario_id, livro_id) {
  const connection = await createConnection();
  // Verificar se o livro existe
  const [livro] = await connection.execute("SELECT id FROM livros WHERE id = ?", [livro_id]);
  if (livro.length === 0) {
    throw new HttpError("Livro não encontrado", 404);
  }

  try {
    await connection.execute(
      "INSERT INTO favoritos (usuario_id, livro_id) VALUES (?, ?)",
      [usuario_id, livro_id]
    );
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      // Ignorar se já for favorito
      return;
    }
    throw error;
  }
}

export async function removerFavorito(usuario_id, livro_id) {
  const connection = await createConnection();
  await connection.execute(
    "DELETE FROM favoritos WHERE usuario_id = ? AND livro_id = ?",
    [usuario_id, livro_id]
  );
}
