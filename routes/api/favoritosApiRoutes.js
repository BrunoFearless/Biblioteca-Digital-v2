import { Router } from "express";
import { adicionarFavorito, listarFavoritos, listarFavoritosIds, removerFavorito } from "../../services/favoritosService.js";
import { handleRouteError } from "../../utils/httpError.js";

export function createFavoritosApiRoutes() {
  const router = Router();

  // Obter favoritos de um utilizador específico (requer query ?usuario_id=)
  router.get("/", async (req, res) => {
    try {
      const { usuario_id } = req.query;
      if (!usuario_id) {
          return res.status(400).json({ error: "usuario_id é obrigatório" });
      }
      return res.status(200).json(await listarFavoritos(usuario_id));
    } catch (error) {
      return handleRouteError(res, error, "Erro ao buscar os favoritos");
    }
  });

  router.get("/ids", async (req, res) => {
    try {
      const { usuario_id } = req.query;
      if (!usuario_id) {
          return res.status(400).json({ error: "usuario_id é obrigatório" });
      }
      return res.status(200).json(await listarFavoritosIds(usuario_id));
    } catch (error) {
      return handleRouteError(res, error, "Erro ao buscar os IDs favoritos");
    }
  });

  router.post("/", async (req, res) => {
    try {
      const { usuario_id, livro_id } = req.body;
      if (!usuario_id || !livro_id) {
          return res.status(400).json({ error: "usuario_id e livro_id são obrigatórios" });
      }
      await adicionarFavorito(usuario_id, livro_id);
      return res.status(201).json({ message: "Adicionado aos favoritos" });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao adicionar favorito");
    }
  });

  router.delete("/", async (req, res) => {
    try {
      const { usuario_id, livro_id } = req.body;
      if (!usuario_id || !livro_id) {
          return res.status(400).json({ error: "usuario_id e livro_id são obrigatórios" });
      }
      await removerFavorito(usuario_id, livro_id);
      return res.status(200).json({ message: "Removido dos favoritos" });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao remover favorito");
    }
  });

  return router;
}
