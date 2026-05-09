import { createConnection } from "./db.js";

async function populatePDFs() {
    const conn = await createConnection();
    try {
        // PDF local para evitar bloqueios de segurança
        const testPdf = "/uploads/test.pdf";
        
        await conn.query("UPDATE livros SET pdf_url = ?", [testPdf]);
        
        console.log("✅ PDFs de teste associados a todos os livros!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

populatePDFs();
