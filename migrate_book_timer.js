import { createConnection } from "./db.js";

async function run() {
    const conn = await createConnection();
    try {
        await conn.execute("ALTER TABLE clubes ADD COLUMN livro_data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
        console.log("Campo livro_data_inicio adicionado.");
    } catch (e) {
        console.log("Nota:", e.message);
    }
    process.exit();
}
run();
