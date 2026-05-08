import { createConnection } from "../db.js";

export async function listarUsuarios() {
  const connection = await createConnection();
  const [rows] = await connection.execute("SELECT * FROM usuarios");
  return rows;
}
