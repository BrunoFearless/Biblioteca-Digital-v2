import { Router } from "express";
import { listarEmprestimos, criarEmprestimo, devolverEmprestimo } from "../../services/emprestimosService.js";
import { handleRouteError } from "../../utils/httpError.js";

export function createEmprestimosApiRoutes() {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      return res.status(200).json(await listarEmprestimos());
    } catch {
      return res.status(500).json({ error: "Erro ao buscar os empréstimos" });
    }
  });

  router.post("/", async (req, res) => {
    try {
      await criarEmprestimo(req.body);
      return res.status(201).json({ message: "Empréstimo registrado com sucesso" });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao criar empréstimo");
    }
  });

  router.put("/:id/devolver", async (req, res) => {
    try {
      await devolverEmprestimo(req.params.id);
      return res.status(200).json({ message: "Empréstimo marcado como devolvido" });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao marcar devolução");
    }
  });

  return router;
}
