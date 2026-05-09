import { Router } from "express";
import { 
  listarClubes, obterClube, criarClube, aderirAoClube, 
  removerMembro, listarMembros, enviarMensagem, listarMensagens, verificarMembro,
  editarClube, eliminarClube, editarMensagem, eliminarMensagem,
  atualizarMetaLeitura, atualizarPaginaAtual, votarNoLivro, listarVotos, adicionarCitacao, listarCitacoes
} from "../../services/clubesService.js";
import { handleRouteError } from "../../utils/httpError.js";

export function createClubesApiRoutes(upload) {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      return res.status(200).json(await listarClubes());
    } catch (error) {
      return handleRouteError(res, error, "Erro ao listar clubes");
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      return res.status(200).json(await obterClube(req.params.id));
    } catch (error) {
      return handleRouteError(res, error, "Erro ao obter clube");
    }
  });

  router.post("/", upload.single('capa'), async (req, res) => {
    try {
      console.log("POST /api/clubes - Body:", req.body);
      console.log("POST /api/clubes - File:", req.file);
      
      const { nome, descricao, livro_id, criador_id } = req.body;
      const capa_url = req.file ? `/uploads/capas/${req.file.filename}` : null;
      
      if (!nome || !criador_id) {
        return res.status(400).json({ error: "Nome e criador são obrigatórios" });
      }
      const id = await criarClube({ nome, descricao, livro_id, criador_id, capa_url });
      return res.status(201).json({ id, message: "Clube criado com sucesso" });
    } catch (error) {
      console.error("Erro em POST /api/clubes:", error);
      return handleRouteError(res, error, "Erro ao criar clube");
    }
  });

  router.post("/:id/aderir", async (req, res) => {
    try {
      const { usuario_id } = req.body;
      await aderirAoClube(req.params.id, usuario_id);
      return res.status(200).json({ message: "Aderiu ao clube" });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao aderir ao clube");
    }
  });

  router.delete("/:id/membro", async (req, res) => {
    try {
      const { usuario_id } = req.body;
      await removerMembro(req.params.id, usuario_id);
      return res.status(200).json({ message: "Saiu do clube com sucesso" });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao sair do clube");
    }
  });

  router.delete("/:id/membros/:usuarioId", async (req, res) => {
    try {
      const { admin_id } = req.body;
      const clube = await obterClube(req.params.id);
      
      if (clube.criador_id !== admin_id) {
          return res.status(403).json({ error: "Apenas o administrador pode expulsar membros" });
      }
      
      await removerMembro(req.params.id, req.params.usuarioId);
      return res.status(200).json({ message: "Membro expulso" });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao expulsar membro");
    }
  });

  router.get("/:id/membros", async (req, res) => {
    try {
      return res.status(200).json(await listarMembros(req.params.id));
    } catch (error) {
      return handleRouteError(res, error, "Erro ao listar membros");
    }
  });

  router.get("/:id/mensagens", async (req, res) => {
    try {
      return res.status(200).json(await listarMensagens(req.params.id));
    } catch (error) {
      return handleRouteError(res, error, "Erro ao listar mensagens");
    }
  });

  router.post("/:id/mensagens", async (req, res) => {
    try {
      const { usuario_id, mensagem } = req.body;
      await enviarMensagem(req.params.id, usuario_id, mensagem);
      return res.status(201).json({ message: "Mensagem enviada" });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao enviar mensagem");
    }
  });

  router.put("/mensagens/:id", async (req, res) => {
    try {
      const { mensagem } = req.body;
      await editarMensagem(req.params.id, mensagem);
      return res.status(200).json({ message: "Mensagem editada" });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao editar mensagem");
    }
  });

  router.delete("/mensagens/:id", async (req, res) => {
    try {
      await eliminarMensagem(req.params.id);
      return res.status(200).json({ message: "Mensagem eliminada" });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao eliminar mensagem");
    }
  });

  // --- NOVAS ROTAS ---

  router.put("/:id/meta", async (req, res) => {
    try {
      const { meta } = req.body;
      await atualizarMetaLeitura(req.params.id, meta);
      return res.status(200).json({ message: "Meta atualizada" });
    } catch (error) { return handleRouteError(res, error, "Erro ao atualizar meta"); }
  });

  router.put("/:id/progresso", async (req, res) => {
    try {
      const { usuario_id, pagina } = req.body;
      await atualizarPaginaAtual(req.params.id, usuario_id, pagina);
      return res.status(200).json({ message: "Progresso atualizado" });
    } catch (error) { return handleRouteError(res, error, "Erro ao atualizar progresso"); }
  });

  router.post("/:id/votos", async (req, res) => {
    try {
      const { usuario_id, livro_id } = req.body;
      await votarNoLivro(req.params.id, usuario_id, livro_id);
      return res.status(200).json({ message: "Voto registado" });
    } catch (error) { return handleRouteError(res, error, "Erro ao votar"); }
  });

  router.get("/:id/votos", async (req, res) => {
    try {
      const votos = await listarVotos(req.params.id);
      return res.status(200).json(votos);
    } catch (error) { return handleRouteError(res, error, "Erro ao listar votos"); }
  });

  router.post("/:id/citacoes", async (req, res) => {
    try {
      const { usuario_id, texto } = req.body;
      await adicionarCitacao(req.params.id, usuario_id, texto);
      return res.status(200).json({ message: "Citação adicionada" });
    } catch (error) { return handleRouteError(res, error, "Erro ao adicionar citação"); }
  });

  router.get("/:id/citacoes", async (req, res) => {
    try {
      const citacoes = await listarCitacoes(req.params.id);
      return res.status(200).json(citacoes);
    } catch (error) { return handleRouteError(res, error, "Erro ao listar citações"); }
  });

  router.get("/:id/verificar/:usuarioId", async (req, res) => {
      try {
          const eMembro = await verificarMembro(req.params.id, req.params.usuarioId);
          return res.status(200).json({ eMembro });
      } catch (error) {
          return handleRouteError(res, error, "Erro ao verificar membro");
      }
  });

  router.put("/:id", upload.single('capa'), async (req, res) => {
    try {
      const id = req.params.id;
      const clubeAtual = await obterClube(id);
      
      const { nome, descricao, livro_id } = req.body;
      let capa_url = clubeAtual.capa_url;
      
      if (req.file) {
          capa_url = `/uploads/capas/${req.file.filename}`;
      }
      
      await editarClube(id, {
          nome: nome || clubeAtual.nome,
          descricao: descricao !== undefined ? descricao : clubeAtual.descricao,
          livro_id: livro_id !== undefined ? (livro_id || null) : clubeAtual.livro_id,
          capa_url
      });
      
      return res.status(200).json({ message: "Clube atualizado com sucesso" });
    } catch (error) {
      console.error(`Erro em PUT /api/clubes/${req.params.id}:`, error);
      return handleRouteError(res, error, "Erro ao atualizar clube");
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      await eliminarClube(req.params.id);
      return res.status(200).json({ message: "Clube eliminado com sucesso" });
    } catch (error) {
      return handleRouteError(res, error, "Erro ao eliminar clube");
    }
  });

  return router;
}
