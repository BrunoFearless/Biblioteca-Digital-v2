import { Router } from "express";
import { createConnection } from "../../db.js";

export function createLeituraApiRoutes() {
  const router = Router();

  // GET /api/leitura/progresso/:livroId?usuario_id=...
  router.get("/progresso/:livroId", async (req, res) => {
    const { livroId } = req.params;
    const { usuario_id } = req.query;
    
    const conn = await createConnection();
    try {
      const [rows] = await conn.query(
        "SELECT ultima_pagina, total_paginas FROM progresso_leitura WHERE usuario_id = ? AND livro_id = ?",
        [usuario_id, livroId]
      );
      res.json(rows[0] || { ultima_pagina: 1, total_paginas: 0 });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST /api/leitura/progresso
  router.post("/progresso", async (req, res) => {
    const { usuario_id, livro_id, ultima_pagina, total_paginas } = req.body;
    
    const conn = await createConnection();
    try {
      await conn.query(
        `INSERT INTO progresso_leitura (usuario_id, livro_id, ultima_pagina, total_paginas) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE ultima_pagina = VALUES(ultima_pagina), total_paginas = VALUES(total_paginas)`,
        [usuario_id, livro_id, ultima_pagina, total_paginas || 0]
      );
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
}
