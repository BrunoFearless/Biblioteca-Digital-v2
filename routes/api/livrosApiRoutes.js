import { Router } from "express";
import { listarLivros, buscarLivroPorId, criarLivro, atualizarLivro, deletarLivro } from "../../services/livrosService.js";
import { handleRouteError } from "../../utils/httpError.js";

export function createLivrosApiRoutes(upload) {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      return res.status(200).json(await listarLivros());
    } catch {
      return res.status(500).json({ error: "Erro ao buscar os livros" });
    }
  });

  // Rota específica de pendentes (DEVE vir antes de /:id)
  router.get("/pendentes", async (req, res) => {
    try {
      const { createConnection } = await import("../../db.js");
      const connection = await createConnection();
      const [rows] = await connection.execute(
        `SELECT * FROM livros WHERE status = 'pendente' ORDER BY id DESC`
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar pendentes." });
    }
  });

  // Rota de livros por usuário (DEVE vir antes de /:id)
  router.get("/usuario/:id", async (req, res) => {
    try {
      const { createConnection } = await import("../../db.js");
      const connection = await createConnection();
      const [rows] = await connection.execute(
        `SELECT * FROM livros WHERE usuario_id = ?`,
        [req.params.id]
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar seus livros." });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const livro = await buscarLivroPorId(req.params.id);
      if (!livro) return res.status(404).json({ error: "Livro não encontrado" });
      return res.status(200).json(livro);
    } catch (error) {
      return handleRouteError(res, error, "Erro ao buscar o livro");
    }
  });

  // Sugerir um novo livro (Capa + PDF)
  router.post("/sugerir", upload.fields([{ name: 'capa', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
    try {
      const { createConnection } = await import("../../db.js");
      const connection = await createConnection();
      const { titulo, autor, categoria, descricao, ano, estoque, usuario_id } = req.body;
      
      // Caminhos com as subpastas corretas configuradas no multer
      const capa_url = req.files['capa'] ? `/uploads/capas/${req.files['capa'][0].filename}` : null;
      const pdf_url = req.files['pdf'] ? `/uploads/livros/${req.files['pdf'][0].filename}` : null;

      const [result] = await connection.execute(
        `INSERT INTO livros (titulo, autor, categoria, descricao, ano_publicacao, estoque, capa_url, pdf_url, status, usuario_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendente', ?)`,
        [titulo, autor, categoria, descricao, ano, estoque, capa_url, pdf_url, usuario_id]
      );

      res.status(201).json({ id: result.insertId, message: "Sugestão enviada com sucesso!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao enviar sugestão." });
    }
  });

  router.post("/", upload.fields([{ name: 'capa', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
    try {
      const result = await criarLivro(req.body, req.files);
      return res.status(201).json({ message: "Livro criado com sucesso", ...result });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao criar livro");
    }
  });

  // Atualizar status de um livro (Aprovar/Rejeitar)
  router.put("/:id/status", async (req, res) => {
    try {
      const { createConnection } = await import("../../db.js");
      const connection = await createConnection();
      const { status } = req.body;
      
      await connection.execute(
        `UPDATE livros SET status = ? WHERE id = ?`,
        [status, req.params.id]
      );
      
      res.json({ message: `Livro marcado como ${status}` });
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar status." });
    }
  });

  router.put("/:id", upload.fields([{ name: 'capa', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), async (req, res) => {
    try {
      const result = await atualizarLivro(req.params.id, req.body, req.files);
      return res.status(200).json({ message: "Livro atualizado com sucesso", ...result });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao atualizar livro");
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      await deletarLivro(req.params.id);
      return res.status(200).json({ message: "Livro deletado com sucesso" });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao deletar livro");
    }
  });

  return router;
}
