import { Router } from "express";
import { avaliarLivro, listarAvaliacoes, obterAvaliacoesMedias, listarAtividadeRecente, obterRankingLeitores } from "../../services/avaliacoesService.js";
import { handleRouteError } from "../../utils/httpError.js";

export function createAvaliacoesApiRoutes() {
  const router = Router();

  // Obter média de todos os livros
  router.get("/medias", async (req, res) => {
    try {
      return res.status(200).json(await obterAvaliacoesMedias());
    } catch (error) {
      return handleRouteError(res, error, "Erro ao buscar médias de avaliações");
    }
  });

  // Obter atividade recente (feed)
  router.get("/recente", async (req, res) => {
    try {
      return res.status(200).json(await listarAtividadeRecente());
    } catch (error) {
      return handleRouteError(res, error, "Erro ao buscar atividade recente");
    }
  });

  // Obter ranking de leitores
  router.get("/ranking", async (req, res) => {
    try {
      const ranking = await obterRankingLeitores();
      return res.status(200).json(ranking);
    } catch (error) {
      console.error("ERRO NO RANKING:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Obter avaliações de um livro específico
  router.get("/livro/:livro_id", async (req, res) => {
    try {
      return res.status(200).json(await listarAvaliacoes(req.params.livro_id));
    } catch (error) {
      return handleRouteError(res, error, "Erro ao buscar avaliações do livro");
    }
  });

  // Criar ou atualizar uma avaliação
  router.post("/", async (req, res) => {
    try {
      const { usuario_id, livro_id, nota, comentario } = req.body;
      if (!usuario_id || !livro_id || !nota) {
          return res.status(400).json({ error: "usuario_id, livro_id e nota são obrigatórios" });
      }
      await avaliarLivro(usuario_id, livro_id, nota, comentario);
      return res.status(201).json({ message: "Avaliação registada com sucesso" });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao registar avaliação");
    }
  });

  // Obter avaliações de um usuário específico
  router.get("/usuario/:id", async (req, res) => {
    try {
      const { createConnection } = await import("../../db.js");
      const connection = await createConnection();
      const [rows] = await connection.execute(
        `SELECT a.*, l.titulo as titulo_livro 
         FROM avaliacoes a 
         JOIN livros l ON a.livro_id = l.id 
         WHERE a.usuario_id = ?`,
        [req.params.id]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar avaliações do usuário" });
    }
  });

  return router;
}
