import express from "express";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import { fileURLToPath } from "url";
import { initializeDatabase } from "./db.js";
import livrosRoutes from "./routes/livroRoutes.js";
import usuariosRoutes from "./routes/usuarioRoutes.js";
import emprestimosRoutes from "./routes/emprestimoRoutes.js";
import relatorioRoutes from "./routes/relatorioRoutes.js";
import { configureUpload } from "./config/upload.js";
import { createApiRoutes } from "./routes/apiRoutes.js";
import { createAdminRoutes } from "./routes/adminRoutes.js";
import { notFoundMiddleware, errorMiddleware } from "./middlewares/errorMiddleware.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

const upload = configureUpload(__dirname);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.use("/admin", createAdminRoutes());
app.use("/api", createApiRoutes(upload));

app.use("/livros", livrosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/emprestimos", emprestimosRoutes);
app.use("/relatorios", relatorioRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

(async () => {
  await initializeDatabase();
  const PORT = process.env.PORT || 3000;
  const HOST = process.env.DB_HOST || "localhost";
  app.listen(PORT, () => {
    console.log(`link: http://${HOST}:${PORT}`);
  });
})();
