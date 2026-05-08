import { Router } from "express";
import { listarUsuarios } from "../../services/usuariosService.js";

export function createUsuariosApiRoutes() {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      return res.status(200).json(await listarUsuarios());
    } catch {
      return res.status(500).json({ error: "Erro ao buscar os usuários" });
    }
  });

  return router;
}
