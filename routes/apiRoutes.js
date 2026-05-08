import { Router } from "express";
import { createLivrosApiRoutes } from "./api/livrosApiRoutes.js";
import { createUsuariosApiRoutes } from "./api/usuariosApiRoutes.js";
import { createEmprestimosApiRoutes } from "./api/emprestimosApiRoutes.js";
import { createReservasApiRoutes } from "./api/reservasApiRoutes.js";
import { createRelatoriosApiRoutes } from "./api/relatoriosApiRoutes.js";
import { createTestApiRoutes } from "./api/testApiRoutes.js";

export function createApiRoutes(upload) {
  const router = Router();
  router.use(createTestApiRoutes());
  router.use("/livros", createLivrosApiRoutes(upload));
  router.use("/usuarios", createUsuariosApiRoutes());
  router.use("/emprestimos", createEmprestimosApiRoutes());
  router.use("/reservas", createReservasApiRoutes());
  router.use("/relatorios", createRelatoriosApiRoutes());

  return router;
}
