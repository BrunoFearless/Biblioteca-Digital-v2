import { createConnection } from "./db.js";

async function migrate() {
    const conn = await createConnection();
    try {
        await conn.execute("ALTER TABLE clubes_mensagens ADD COLUMN foi_editada BOOLEAN DEFAULT FALSE");
        console.log("Coluna foi_editada adicionada com sucesso.");
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN_NAME') {
            console.log("A coluna foi_editada já existe.");
        } else {
            console.error("Erro na migração:", error);
        }
    } finally {
        process.exit(0);
    }
}

migrate();
