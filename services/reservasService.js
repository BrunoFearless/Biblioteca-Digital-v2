import { createConnection } from "../db.js";

export async function criarReserva({ usuario_id, livro_id }) {
  const connection = await createConnection();
  await connection.execute(
    "INSERT INTO reservas (usuario_id, livro_id, data_reserva, status) VALUES (?, ?, ?, 'ativa')",
    [usuario_id, livro_id, new Date().toISOString().split("T")[0]]
  );
}

export async function listarReservas() {
  const connection = await createConnection();
  const [rows] = await connection.execute("SELECT * FROM reservas");
  return rows;
}

export async function cancelarReserva(id) {
  const connection = await createConnection();
  const [rows] = await connection.execute("SELECT * FROM reservas WHERE id = ?", [id]);
  if (rows.length === 0) {
    const err = new Error("Reserva não encontrada");
    err.status = 404;
    throw err;
  }
  await connection.execute("UPDATE reservas SET status = 'cancelada' WHERE id = ?", [id]);
}
