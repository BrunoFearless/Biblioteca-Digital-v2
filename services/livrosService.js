import { createConnection } from "../db.js";

export async function listarLivros() {
  const connection = await createConnection();
  const [rows] = await connection.execute("SELECT * FROM livros");
  return rows;
}

export async function buscarLivroPorId(id) {
  const connection = await createConnection();
  const [rows] = await connection.execute("SELECT * FROM livros WHERE id = ?", [id]);
  return rows[0] || null;
}

export async function criarLivro(data, file) {
  const { titulo, autor, genero, ano_publicacao, estoque, capa_url } = data;
  const connection = await createConnection();
  let capaFinal = null;
  if (file) capaFinal = `/uploads/capas/${file.filename}`;
  else if (capa_url) capaFinal = capa_url;

  const [result] = await connection.execute(
    "INSERT INTO livros (titulo, autor, genero, ano_publicacao, estoque, capa_url) VALUES (?, ?, ?, ?, ?, ?)",
    [titulo, autor, genero, ano_publicacao, estoque || 1, capaFinal]
  );
  return { id: result.insertId, capa_url: capaFinal };
}

export async function atualizarLivro(id, data, file) {
  const { titulo, autor, genero, ano_publicacao, estoque, capa_url } = data;
  const connection = await createConnection();
  let capaParaSalvar = null;
  if (file) capaParaSalvar = `/uploads/capas/${file.filename}`;
  else if (capa_url) capaParaSalvar = capa_url;
  else {
    const [livro] = await connection.execute("SELECT capa_url FROM livros WHERE id = ?", [id]);
    if (livro.length > 0) capaParaSalvar = livro[0].capa_url;
  }

  await connection.execute(
    "UPDATE livros SET titulo = ?, autor = ?, genero = ?, ano_publicacao = ?, estoque = ?, capa_url = ? WHERE id = ?",
    [titulo, autor, genero, ano_publicacao, estoque, capaParaSalvar, id]
  );
  return { capa_url: capaParaSalvar };
}

export async function deletarLivro(id) {
  const connection = await createConnection();
  await connection.execute("DELETE FROM livros WHERE id = ?", [id]);
}
