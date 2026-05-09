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

  router.get("/:id", async (req, res) => {
    try {
      const livro = await buscarLivroPorId(req.params.id);
      if (!livro) return res.status(404).json({ error: "Livro não encontrado" });
      return res.status(200).json(livro);
    } catch (error) {
      return handleRouteError(res, error, "Erro ao buscar o livro");
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
