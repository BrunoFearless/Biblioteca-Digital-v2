import { Router } from "express";
import { listarUsuarios } from "../../services/usuariosService.js";

export function createUsuariosApiRoutes() {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      return res.status(200).json(await listarUsuarios());
    } catch {
      return res.status(500).json({ error: "Erro ao buscar os usuários" });
    }
  });

  router.get("/publico/:id", async (req, res) => {
    try {
      const { createConnection } = await import("../../db.js");
      const connection = await createConnection();
      const usuarioId = req.params.id;
      
      // 1. Dados básicos
      const [userRows] = await connection.execute('SELECT nome FROM usuarios WHERE id = ?', [usuarioId]);
      if (userRows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });

      // 2. Empréstimos (Atuais e Lidos)
      const [emprestimos] = await connection.execute(`
        SELECT e.*, l.titulo, l.autor, l.capa_url 
        FROM emprestimos e 
        JOIN livros l ON e.livro_id = l.id 
        WHERE e.usuario_id = ?
        ORDER BY e.data_emprestimo DESC
      `, [usuarioId]);

      // 3. Livros Publicados (Aprovados)
      const [publicados] = await connection.execute(`
        SELECT * FROM livros WHERE usuario_id = ? AND status IN ('aprovado', 'publico')
      `, [usuarioId]);

      // 4. Críticas e Avaliações
      const [avaliacoes] = await connection.execute(`
        SELECT a.*, l.titulo as titulo_livro 
        FROM avaliacoes a 
        JOIN livros l ON a.livro_id = l.id 
        WHERE a.usuario_id = ?
        ORDER BY a.data_avaliacao DESC
      `, [usuarioId]);

      res.json({
        id: usuarioId,
        nome: userRows[0].nome,
        emprestimos,
        publicados,
        avaliacoes
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar perfil completo' });
    }
  });

  return router;
}
