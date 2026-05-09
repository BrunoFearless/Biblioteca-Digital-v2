import { createConnection } from "./db.js";

async function simulateReadings() {
    const conn = await createConnection();
    try {
        // 1. Vamos pegar em alguns empréstimos existentes e marcá-los como devolvidos
        // Se não houver empréstimos, criamos alguns de teste já concluídos
        const [users] = await conn.query("SELECT id FROM usuarios LIMIT 3");
        const [books] = await conn.query("SELECT id FROM livros LIMIT 5");

        if (users.length > 0 && books.length > 0) {
            console.log("Simulando leituras concluídas...");
            
            // Harvey (primeiro user) leu 3 livros
            await conn.query("INSERT INTO emprestimos (usuario_id, livro_id, data_emprestimo, data_devolucao, devolvido) VALUES (?, ?, '2024-01-01', '2024-01-10', 1)", [users[0].id, books[0].id]);
            await conn.query("INSERT INTO emprestimos (usuario_id, livro_id, data_emprestimo, data_devolucao, devolvido) VALUES (?, ?, '2024-01-15', '2024-01-20', 1)", [users[0].id, books[1].id]);
            await conn.query("INSERT INTO emprestimos (usuario_id, livro_id, data_emprestimo, data_devolucao, devolvido) VALUES (?, ?, '2024-02-01', '2024-02-10', 1)", [users[0].id, books[2].id]);

            if (users[1]) {
                // Segundo user leu 1 livro
                await conn.query("INSERT INTO emprestimos (usuario_id, livro_id, data_emprestimo, data_devolucao, devolvido) VALUES (?, ?, '2024-01-05', '2024-01-15', 1)", [users[1].id, books[3].id]);
            }

            console.log("✅ Simulação concluída! Harvey agora deve ter 3 lidos no Ranking.");
        } else {
            console.log("❌ Não foram encontrados utilizadores ou livros suficientes para a simulação.");
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

simulateReadings();
