import test from "node:test";
import assert from "node:assert/strict";
import { criarEmprestimo } from "../../services/emprestimosService.js";

function createConnectionMock(sequence) {
  let index = 0;
  const calls = [];

  return {
    calls,
    async execute(sql, params = []) {
      calls.push({ sql, params });
      const next = sequence[index++];
      if (!next) throw new Error("Mock sem resposta para a query atual");
      return [next];
    }
  };
}

test("criarEmprestimo retorna erro 400 quando livro sem estoque", async () => {
  const connection = createConnectionMock([[{ estoque: 0 }]]);
  const factory = async () => connection;

  await assert.rejects(
    () =>
      criarEmprestimo(
        { usuario_id: 1, livro_id: 10, data_emprestimo: "2026-05-08", data_devolucao: "2026-05-18" },
        factory
      ),
    (error) => error.status === 400 && error.message === "Livro indisponível"
  );
});

test("criarEmprestimo respeita limite do aluno (3 ativos)", async () => {
  const connection = createConnectionMock([[{ estoque: 2 }], [{ tipo: "aluno" }], [{ total: 3 }]]);
  const factory = async () => connection;

  await assert.rejects(
    () =>
      criarEmprestimo(
        { usuario_id: 1, livro_id: 10, data_emprestimo: "2026-05-08", data_devolucao: "2026-05-18" },
        factory
      ),
    (error) => error.status === 400 && /Limite de empréstimos/.test(error.message)
  );
});

test("criarEmprestimo cria empréstimo quando válido", async () => {
  const connection = createConnectionMock([
    [{ estoque: 3 }],
    [{ tipo: "professor" }],
    [{ total: 2 }],
    { affectedRows: 1 },
    { affectedRows: 1 }
  ]);
  const factory = async () => connection;

  await criarEmprestimo(
    { usuario_id: 1, livro_id: 10, data_emprestimo: "2026-05-08", data_devolucao: "2026-05-18" },
    factory
  );

  assert.equal(connection.calls.length, 5);
  assert.match(connection.calls[3].sql, /INSERT INTO emprestimos/);
  assert.match(connection.calls[4].sql, /UPDATE livros SET estoque = estoque - 1/);
});
