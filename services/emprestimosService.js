import { createConnection } from "../db.js";
import { HttpError } from "../utils/httpError.js";

export async function listarEmprestimos() {
  const connection = await createConnection();
  const [rows] = await connection.execute("SELECT * FROM emprestimos");
  return rows;
}

export async function criarEmprestimo(
  { usuario_id, livro_id, data_emprestimo, data_devolucao },
  connectionFactory = createConnection
) {
  const connection = await connectionFactory();
  const [livro] = await connection.execute("SELECT estoque FROM livros WHERE id = ?", [livro_id]);
  if (livro.length === 0 || livro[0].estoque <= 0) {
    throw new HttpError("Livro indisponível", 400);
  }

  const [usuario] = await connection.execute("SELECT tipo FROM usuarios WHERE id = ?", [usuario_id]);
  if (usuario.length === 0) {
    throw new HttpError("Usuário não encontrado", 404);
  }
  const tipoUsuario = (usuario[0].tipo || "").toLowerCase();
  const [emprestimosAtivos] = await connection.execute(
    "SELECT COUNT(*) as total FROM emprestimos WHERE usuario_id = ? AND devolvido = 0",
    [usuario_id]
  );
  const limite = tipoUsuario === "professor" ? 6 : 3;
  if ((emprestimosAtivos[0].total || 0) >= limite) {
    throw new HttpError(`Limite de empréstimos atingido para ${tipoUsuario}.`, 400);
  }

  await connection.execute(
    "INSERT INTO emprestimos (usuario_id, livro_id, data_emprestimo, data_devolucao) VALUES (?, ?, ?, ?)",
    [usuario_id, livro_id, data_emprestimo, data_devolucao]
  );
  await connection.execute(
    "UPDATE livros SET estoque = estoque - 1, vezes_emprestado = vezes_emprestado + 1 WHERE id = ?",
    [livro_id]
  );
}

export async function devolverEmprestimo(id, connectionFactory = createConnection) {
  const connection = await connectionFactory();
  const [emprestimo] = await connection.execute("SELECT livro_id FROM emprestimos WHERE id = ?", [id]);
  if (emprestimo.length === 0) {
    throw new HttpError("Empréstimo não encontrado", 404);
  }
  await connection.execute("UPDATE emprestimos SET devolvido = TRUE WHERE id = ?", [id]);
  await connection.execute("UPDATE livros SET estoque = estoque + 1 WHERE id = ?", [emprestimo[0].livro_id]);
}

export async function criarEmprestimoTeste({ usuario_id, livro_id, data_emprestimo, data_devolucao }) {
  const connection = await createConnection();
  const [result] = await connection.execute(
    "INSERT INTO emprestimos (usuario_id, livro_id, data_emprestimo, data_devolucao) VALUES (?, ?, ?, ?)",
    [usuario_id, livro_id, data_emprestimo, data_devolucao]
  );
  return result.insertId;
}
