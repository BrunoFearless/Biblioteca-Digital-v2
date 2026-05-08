import { Router } from "express";
import {
  relatorioEmprestimosPendentes,
  relatorioEmprestimosAtivos,
  relatorioLivrosMaisEmprestados
} from "../../services/relatoriosService.js";
import { handleRouteError } from "../../utils/httpError.js";

export function createRelatoriosApiRoutes() {
  const router = Router();

  router.get("/emprestimos-pendentes", async (req, res) => {
    try {
      return res.status(200).json(await relatorioEmprestimosPendentes());
    } catch (error) {
      return handleRouteError(res, error, "Erro ao buscar empréstimos pendentes");
    }
  });

  router.get("/emprestimos-ativos", async (req, res) => {
    try {
      return res.status(200).json(await relatorioEmprestimosAtivos());
    } catch (error) {
      return handleRouteError(res, error, "Erro ao buscar empréstimos ativos");
    }
  });

  router.get("/livros-mais-emprestados", async (req, res) => {
    try {
      return res.status(200).json(await relatorioLivrosMaisEmprestados());
    } catch (error) {
      return handleRouteError(res, error, "Erro ao buscar livros mais emprestados");
    }
  });

  return router;
}
