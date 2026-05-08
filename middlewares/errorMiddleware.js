import { handleRouteError } from "../utils/httpError.js";

export function notFoundMiddleware(req, res) {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Rota não encontrada" });
  }
  return res.status(404).send("Rota não encontrada");
}

export function errorMiddleware(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (req.path.startsWith("/api/")) {
    return handleRouteError(res, err, "Erro interno no servidor");
  }

  return res.status(err?.status || 500).send(err?.message || "Erro interno no servidor");
}
