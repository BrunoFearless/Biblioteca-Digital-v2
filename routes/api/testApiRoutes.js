import { Router } from "express";
import { criarEmprestimoTeste } from "../../services/emprestimosService.js";
import { handleRouteError } from "../../utils/httpError.js";

export function createTestApiRoutes() {
  const router = Router();

  router.post("/test-emprestimo", async (req, res) => {
    try {
      const id = await criarEmprestimoTeste(req.body);
      return res.status(201).json({ message: "Empréstimo criado com sucesso", id });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao criar empréstimo de teste");
    }
  });

  return router;
}
