import { createConnection } from "./db.js";

async function migrate() {
    const conn = await createConnection();
    try {
        console.log("Iniciando migração avançada...");
        
        // 1. Colunas extras
        await conn.execute("ALTER TABLE clubes ADD COLUMN meta_leitura TEXT NULL");
        await conn.execute("ALTER TABLE clubes_membros ADD COLUMN pagina_atual INT DEFAULT 0");
        
        // 2. Tabela de Votos
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS clubes_votos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                clube_id INT NOT NULL,
                livro_id INT NOT NULL,
                usuario_id INT NOT NULL,
                UNIQUE KEY unique_voto (clube_id, usuario_id),
                FOREIGN KEY (clube_id) REFERENCES clubes(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            )
        `);
        
        // 3. Tabela de Citações
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS clubes_citacoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                clube_id INT NOT NULL,
                usuario_id INT NOT NULL,
                texto TEXT NOT NULL,
                data_postagem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (clube_id) REFERENCES clubes(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            )
        `);

        console.log("Migração avançada concluída com sucesso.");
    } catch (error) {
        console.log("Nota: Algumas colunas/tabelas podem já existir.", error.message);
    } finally {
        process.exit(0);
    }
}

migrate();
