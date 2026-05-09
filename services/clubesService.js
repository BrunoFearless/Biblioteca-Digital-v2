import { createConnection } from "../db.js";
import { HttpError } from "../utils/httpError.js";

export async function listarClubes() {
  const connection = await createConnection();
  const [rows] = await connection.execute(`
    SELECT c.*, l.titulo as livro_titulo, l.capa_url as livro_capa, u.nome as criador_nome,
    (SELECT COUNT(*) FROM clubes_membros WHERE clube_id = c.id) as total_membros
    FROM clubes c
    LEFT JOIN livros l ON c.livro_id = l.id
    JOIN usuarios u ON c.criador_id = u.id
    ORDER BY c.data_criacao DESC
  `);
  return rows;
}

export async function obterClube(id) {
  const connection = await createConnection();
  
  // Verificar expiração do livro (30 dias)
  const [clubeCheck] = await connection.execute("SELECT livro_id, livro_data_inicio FROM clubes WHERE id = ?", [id]);
  if (clubeCheck.length > 0 && clubeCheck[0].livro_id) {
      const dataInicio = new Date(clubeCheck[0].livro_data_inicio);
      const hoje = new Date();
      const diffDias = (hoje - dataInicio) / (1000 * 60 * 60 * 24);
      
      if (diffDias >= 30) {
          // Expirou! Limpar livro e meta
          await connection.execute(
            "UPDATE clubes SET livro_id = NULL, meta_leitura = NULL, livro_data_inicio = CURRENT_TIMESTAMP WHERE id = ?", 
            [id]
          );
          // Opcional: Enviar mensagem de sistema
          await enviarMensagem(id, 1, "[SISTEMA] O tempo de leitura coletiva terminou! O livro foi removido. Votem no próximo!");
      }
  }

  const [rows] = await connection.execute(`
    SELECT c.*, l.titulo as livro_titulo, l.capa_url as livro_capa, u.nome as criador_nome
    FROM clubes c
    LEFT JOIN livros l ON c.livro_id = l.id
    JOIN usuarios u ON c.criador_id = u.id
    WHERE c.id = ?
  `, [id]);
  
  if (rows.length === 0) throw new HttpError("Clube não encontrado", 404);
  return rows[0];
}

export async function criarClube(dados) {
  const connection = await createConnection();
  const { nome, descricao, livro_id, criador_id, capa_url } = dados;
  
  const [result] = await connection.execute(
    "INSERT INTO clubes (nome, descricao, livro_id, criador_id, capa_url) VALUES (?, ?, ?, ?, ?)",
    [nome, descricao, livro_id || null, criador_id, capa_url || null]
  );
  
  const clubeId = result.insertId;
  
  // O criador entra automaticamente no clube
  await aderirAoClube(clubeId, criador_id);
  
  return clubeId;
}

export async function aderirAoClube(clube_id, usuario_id) {
  const connection = await createConnection();
  try {
    await connection.execute(
      "INSERT INTO clubes_membros (clube_id, usuario_id) VALUES (?, ?)",
      [clube_id, usuario_id]
    );
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return; // Já é membro
    throw error;
  }
}

export async function removerMembro(clube_id, usuario_id) {
  const connection = await createConnection();
  await connection.execute(
    "DELETE FROM clubes_membros WHERE clube_id = ? AND usuario_id = ?",
    [clube_id, usuario_id]
  );
}

export async function listarMembros(clube_id) {
  const connection = await createConnection();
  const [rows] = await connection.execute(`
    SELECT u.id, u.nome, u.email, cm.data_adesao, cm.pagina_atual
    FROM clubes_membros cm
    JOIN usuarios u ON cm.usuario_id = u.id
    WHERE cm.clube_id = ?
  `, [clube_id]);
  return rows;
}

export async function enviarMensagem(clube_id, usuario_id, mensagem) {
  const connection = await createConnection();
  await connection.execute(
    "INSERT INTO clubes_mensagens (clube_id, usuario_id, mensagem) VALUES (?, ?, ?)",
    [clube_id, usuario_id, mensagem]
  );
}

export async function listarMensagens(clube_id) {
  const connection = await createConnection();
  const [rows] = await connection.execute(`
    SELECT cm.*, u.nome as usuario_nome
    FROM clubes_mensagens cm
    JOIN usuarios u ON cm.usuario_id = u.id
    WHERE cm.clube_id = ?
    ORDER BY cm.data_envio ASC
  `, [clube_id]);
  return rows;
}

export async function editarMensagem(id, mensagem) {
    const connection = await createConnection();
    await connection.execute(
        "UPDATE clubes_mensagens SET mensagem = ?, foi_editada = TRUE WHERE id = ?",
        [mensagem, id]
    );
}

export async function eliminarMensagem(id) {
    const connection = await createConnection();
    await connection.execute("DELETE FROM clubes_mensagens WHERE id = ?", [id]);
}

export async function verificarMembro(clube_id, usuario_id) {
    const connection = await createConnection();
    const [rows] = await connection.execute(
        "SELECT 1 FROM clubes_membros WHERE clube_id = ? AND usuario_id = ?",
        [clube_id, usuario_id]
    );
    return rows.length > 0;
}

// --- NOVAS FUNCIONALIDADES ---

export async function atualizarMetaLeitura(id, meta) {
    const connection = await createConnection();
    await connection.execute("UPDATE clubes SET meta_leitura = ? WHERE id = ?", [meta, id]);
}

export async function atualizarPaginaAtual(clube_id, usuario_id, pagina) {
    const connection = await createConnection();
    await connection.execute(
        "UPDATE clubes_membros SET pagina_atual = ? WHERE clube_id = ? AND usuario_id = ?",
        [pagina, clube_id, usuario_id]
    );
}

export async function votarNoLivro(clube_id, usuario_id, livro_id) {
    const connection = await createConnection();
    await connection.execute(
        "INSERT INTO clubes_votos (clube_id, usuario_id, livro_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE livro_id = VALUES(livro_id)",
        [clube_id, usuario_id, livro_id]
    );
}

export async function listarVotos(clube_id) {
    const connection = await createConnection();
    const [rows] = await connection.execute(`
        SELECT cv.livro_id, l.titulo as livro_titulo, COUNT(*) as total 
        FROM clubes_votos cv 
        JOIN livros l ON cv.livro_id = l.id 
        WHERE cv.clube_id = ? 
        GROUP BY cv.livro_id
        ORDER BY total DESC
    `, [clube_id]);
    return rows;
}

export async function adicionarCitacao(clube_id, usuario_id, texto) {
    const connection = await createConnection();
    await connection.execute(
        "INSERT INTO clubes_citacoes (clube_id, usuario_id, texto) VALUES (?, ?, ?)",
        [clube_id, usuario_id, texto]
    );
}

export async function listarCitacoes(clube_id) {
    const connection = await createConnection();
    const [rows] = await connection.execute(`
        SELECT cc.*, u.nome as usuario_nome 
        FROM clubes_citacoes cc 
        JOIN usuarios u ON cc.usuario_id = u.id 
        WHERE cc.clube_id = ? 
        ORDER BY cc.data_postagem DESC 
        LIMIT 10
    `, [clube_id]);
    return rows;
}

export async function editarClube(id, dados) {
    const connection = await createConnection();
    const { nome, descricao, livro_id, capa_url } = dados;
    
    // Pegar o livro atual para ver se mudou
    const [atual] = await connection.execute("SELECT livro_id FROM clubes WHERE id = ?", [id]);
    const mudouLivro = atual.length > 0 && atual[0].livro_id !== livro_id;

    const sql = mudouLivro 
        ? "UPDATE clubes SET nome = ?, descricao = ?, livro_id = ?, capa_url = ?, livro_data_inicio = CURRENT_TIMESTAMP WHERE id = ?"
        : "UPDATE clubes SET nome = ?, descricao = ?, livro_id = ?, capa_url = ? WHERE id = ?";
    
    await connection.execute(sql, [nome, descricao, livro_id || null, capa_url || null, id]);
}

export async function eliminarClube(id) {
    const connection = await createConnection();
    await connection.execute("DELETE FROM clubes WHERE id = ?", [id]);
}
