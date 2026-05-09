import { Router } from "express";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const key = process.env.GROQ_API_KEY;
if (key) {
  console.log("IA: Chave Groq detetada terminando em:", key.substring(key.length - 4));
} else {
  console.log("IA: AVISO - GROQ_API_KEY não encontrada no .env!");
}

const groq = new Groq({ apiKey: key || "CHAVE_NAO_CONFIGURADA" });

export function createIaApiRoutes() {
  const router = Router();

  router.post("/perguntar", async (req, res) => {
    const { pergunta, livroContexto } = req.body;

    try {
      let contextoReal = "";
      
      // 1. Extração do PDF
      if (livroContexto.pdf_url) {
        const pdfPath = path.join(process.cwd(), "public", livroContexto.pdf_url);
        if (fs.existsSync(pdfPath)) {
          try {
            const dataBuffer = fs.readFileSync(pdfPath);
            // Chamada direta ao require garantindo que é a função
            const data = await pdf(dataBuffer);
            contextoReal = data.text.substring(0, 8000);
          } catch (e) { 
            console.error("Erro PDF Interno:", e);
            contextoReal = "Erro ao ler o texto do PDF.";
          }
        }
      }

      // 2. Chamada ao Groq (Modelo Instant para estabilidade)
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `És um assistente de leitura da Biblioteca Digital. Ajuda o utilizador com o livro "${livroContexto.titulo}" de ${livroContexto.autor}. 
            REGRAS DE RESPOSTA:
            1. Responde de forma natural e profissional.
            2. NÃO USES formatacão Markdown como asteriscos (**), cardinais (#) ou listas complexas.
            3. O texto deve ser limpo e direto para leitura fácil num chat.
            Contexto do PDF: ${contextoReal.substring(0, 6000)}`
          },
          {
            role: "user",
            content: pergunta
          }
        ],
        model: "llama-3.1-8b-instant",
      });

      const resposta = chatCompletion.choices[0]?.message?.content || "Não consegui gerar uma resposta.";
      res.json({ resposta });

    } catch (e) {
      console.error("ERRO GROQ:", e);
      res.json({ 
        resposta: "Erro ao ligar ao Groq. Verifica se adicionaste a GROQ_API_KEY no ficheiro .env corretamente." 
      });
    }
  });

  return router;
}
