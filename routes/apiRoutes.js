import { Router } from "express";
import { createLivrosApiRoutes } from "./api/livrosApiRoutes.js";
import { createUsuariosApiRoutes } from "./api/usuariosApiRoutes.js";
import { createEmprestimosApiRoutes } from "./api/emprestimosApiRoutes.js";
import { createReservasApiRoutes } from "./api/reservasApiRoutes.js";
import { createRelatoriosApiRoutes } from "./api/relatoriosApiRoutes.js";
import { createTestApiRoutes } from "./api/testApiRoutes.js";
import { createFavoritosApiRoutes } from "./api/favoritosApiRoutes.js";
import { createAvaliacoesApiRoutes } from "./api/avaliacoesApiRoutes.js";
import { createLeituraApiRoutes } from "./api/leituraApiRoutes.js";
import { createIaApiRoutes } from "./api/iaApiRoutes.js";
import { createClubesApiRoutes } from "./api/clubesApiRoutes.js";

export function createApiRoutes(upload) {
  const router = Router();
  router.use(createTestApiRoutes());
  router.use("/livros", createLivrosApiRoutes(upload));
  router.use("/usuarios", createUsuariosApiRoutes());
  router.use("/emprestimos", createEmprestimosApiRoutes());
  router.use("/reservas", createReservasApiRoutes());
  router.use("/relatorios", createRelatoriosApiRoutes());
  router.use("/favoritos", createFavoritosApiRoutes());
  router.use("/avaliacoes", createAvaliacoesApiRoutes());
  router.use("/leitura", createLeituraApiRoutes());
  router.use("/ia", createIaApiRoutes());
  router.use("/clubes", createClubesApiRoutes(upload));

  return router;
}
