import { Router } from "express";
import { criarReserva, listarReservas, cancelarReserva } from "../../services/reservasService.js";
import { handleRouteError } from "../../utils/httpError.js";

export function createReservasApiRoutes() {
  const router = Router();

  router.post("/", async (req, res) => {
    try {
      await criarReserva(req.body);
      return res.status(201).json({ message: "Reserva registrada com sucesso" });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao criar reserva");
    }
  });

  router.get("/", async (req, res) => {
    try {
      return res.status(200).json(await listarReservas());
    } catch {
      return res.status(500).json({ error: "Erro ao buscar as reservas" });
    }
  });

  router.put("/:id/cancelar", async (req, res) => {
    try {
      await cancelarReserva(req.params.id);
      return res.status(200).json({ message: "Reserva cancelada com sucesso" });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao cancelar reserva");
    }
  });

  return router;
}
