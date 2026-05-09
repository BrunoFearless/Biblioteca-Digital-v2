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

export async function criarLivro(data, files) {
  const { titulo, autor, genero, ano_publicacao, estoque, capa_url, descricao } = data;
  const connection = await createConnection();
  
  let capaFinal = null;
  if (files && files.capa) capaFinal = `/uploads/capas/${files.capa[0].filename}`;
  else if (capa_url) capaFinal = capa_url;

  let pdfFinal = null;
  if (files && files.pdf) pdfFinal = `/uploads/livros/${files.pdf[0].filename}`;

  const [result] = await connection.execute(
    "INSERT INTO livros (titulo, autor, genero, ano_publicacao, estoque, capa_url, descricao, pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [titulo, autor, genero, ano_publicacao, estoque || 1, capaFinal, descricao, pdfFinal]
  );
  return { id: result.insertId, capa_url: capaFinal, pdf_url: pdfFinal };
}

export async function atualizarLivro(id, data, files) {
  const { titulo, autor, genero, ano_publicacao, estoque, capa_url, descricao } = data;
  const connection = await createConnection();
  
  let capaParaSalvar = null;
  if (files && files.capa) capaParaSalvar = `/uploads/capas/${files.capa[0].filename}`;
  else if (capa_url) capaParaSalvar = capa_url;
  else {
    const [livro] = await connection.execute("SELECT capa_url FROM livros WHERE id = ?", [id]);
    if (livro.length > 0) capaParaSalvar = livro[0].capa_url;
  }

  let pdfParaSalvar = null;
  if (files && files.pdf) pdfParaSalvar = `/uploads/livros/${files.pdf[0].filename}`;
  else {
    const [livro] = await connection.execute("SELECT pdf_url FROM livros WHERE id = ?", [id]);
    if (livro.length > 0) pdfParaSalvar = livro[0].pdf_url;
  }

  await connection.execute(
    "UPDATE livros SET titulo = ?, autor = ?, genero = ?, ano_publicacao = ?, estoque = ?, capa_url = ?, descricao = ?, pdf_url = ? WHERE id = ?",
    [titulo, autor, genero, ano_publicacao, estoque, capaParaSalvar, descricao, pdfParaSalvar, id]
  );
  return { capa_url: capaParaSalvar, pdf_url: pdfParaSalvar };
}

export async function deletarLivro(id) {
  const connection = await createConnection();
  await connection.execute("DELETE FROM livros WHERE id = ?", [id]);
}
