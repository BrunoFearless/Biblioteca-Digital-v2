import { Router } from "express";
import { avaliarLivro, listarAvaliacoes, obterAvaliacoesMedias } from "../../services/avaliacoesService.js";
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

  return router;
}
