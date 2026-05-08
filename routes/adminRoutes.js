import { Router } from "express";
import { createConnection } from "../db.js";

export function createAdminRoutes() {
  const router = Router();

  router.post("/seed", async (req, res) => {
    try {
      const connection = await createConnection();

      await connection.execute("DELETE FROM reservas");
      await connection.execute("DELETE FROM emprestimos");
      await connection.execute("DELETE FROM usuarios");
      await connection.execute("DELETE FROM livros");

      const livros = [
        { titulo: "Clean Code", autor: "Robert C. Martin", genero: "Programação", ano: 2008, estoque: 5 },
        { titulo: "Design Patterns", autor: "Gang of Four", genero: "Programação", ano: 1994, estoque: 3 },
        { titulo: "Refactoring", autor: "Martin Fowler", genero: "Programação", ano: 1999, estoque: 4 },
        { titulo: "Code Complete", autor: "Steve McConnell", genero: "Programação", ano: 2004, estoque: 2 },
        { titulo: "The Pragmatic Programmer", autor: "Hunt & Thomas", genero: "Programação", ano: 1999, estoque: 6 },
        { titulo: "1984", autor: "George Orwell", genero: "Ficção", ano: 1949, estoque: 4 },
        { titulo: "O Senhor das Moscas", autor: "William Golding", genero: "Ficção", ano: 1954, estoque: 3 },
        { titulo: "O Alienígena", autor: "Ray Bradbury", genero: "Ficção", ano: 1950, estoque: 2 },
        { titulo: "O Jovem Holden", autor: "J.D. Salinger", genero: "Ficção", ano: 1951, estoque: 5 },
        { titulo: "Grande Esperança", autor: "Charles Dickens", genero: "Ficção", ano: 1861, estoque: 2 },
        { titulo: "O Senhor dos Anéis", autor: "J.R.R. Tolkien", genero: "Fantasy", ano: 1954, estoque: 2 },
        { titulo: "Harry Potter e a Pedra Filosofal", autor: "J.K. Rowling", genero: "Fantasy", ano: 1998, estoque: 6 },
        { titulo: "As Crônicas de Nárnia", autor: "C.S. Lewis", genero: "Fantasy", ano: 1950, estoque: 3 },
        { titulo: "A Game of Thrones", autor: "George R.R. Martin", genero: "Fantasy", ano: 1996, estoque: 1 },
        { titulo: "O Hobbit", autor: "J.R.R. Tolkien", genero: "Fantasy", ano: 1937, estoque: 4 },
        { titulo: "Assassinato no Expresso do Oriente", autor: "Agatha Christie", genero: "Mistério", ano: 1934, estoque: 3 },
        { titulo: "O Código Da Vinci", autor: "Dan Brown", genero: "Mistério", ano: 2003, estoque: 4 },
        { titulo: "Sherlock Holmes", autor: "Arthur Conan Doyle", genero: "Mistério", ano: 1887, estoque: 5 },
        { titulo: "Menina Desaparecida", autor: "Gillian Flynn", genero: "Thriller", ano: 2012, estoque: 2 },
        { titulo: "O Silêncio dos Inocentes", autor: "Thomas Harris", genero: "Thriller", ano: 1988, estoque: 2 },
        { titulo: "Orgulho e Preconceito", autor: "Jane Austen", genero: "Romance", ano: 1813, estoque: 4 },
        { titulo: "O Caderno", autor: "Nicholas Sparks", genero: "Romance", ano: 1996, estoque: 3 },
        { titulo: "Jane Eyre", autor: "Charlotte Brontë", genero: "Romance", ano: 1847, estoque: 2 },
        { titulo: "O Morro dos Ventos Uivantes", autor: "Emily Brontë", genero: "Romance", ano: 1847, estoque: 3 },
        { titulo: "Romeu e Julieta", autor: "William Shakespeare", genero: "Romance", ano: 1595, estoque: 1 },
        { titulo: "Cosmos", autor: "Carl Sagan", genero: "Científico", ano: 1980, estoque: 4 },
        { titulo: "Uma Breve História do Tempo", autor: "Stephen Hawking", genero: "Científico", ano: 1988, estoque: 3 },
        { titulo: "A Origem das Espécies", autor: "Charles Darwin", genero: "Científico", ano: 1859, estoque: 2 },
        { titulo: "Sapiens", autor: "Yuval Noah Harari", genero: "Científico", ano: 2011, estoque: 5 },
        { titulo: "O Gene Egoísta", autor: "Richard Dawkins", genero: "Científico", ano: 1976, estoque: 3 },
      ];

      for (const livro of livros) {
        await connection.execute(
          "INSERT INTO livros (titulo, autor, genero, ano_publicacao, estoque) VALUES (?, ?, ?, ?, ?)",
          [livro.titulo, livro.autor, livro.genero, livro.ano, livro.estoque]
        );
      }

      const usuarios = [
        { nome: "João Silva", endereco: "Rua A, 123", email: "joao@email.com", telefone: "11999999999" },
        { nome: "Maria Santos", endereco: "Av. B, 456", email: "maria@email.com", telefone: "11988888888" },
        { nome: "Pedro Oliveira", endereco: "Rua C, 789", email: "pedro@email.com", telefone: "11977777777" },
        { nome: "Ana Costa", endereco: "Rua D, 101", email: "ana@email.com", telefone: "11966666666" },
        { nome: "Carlos Mendes", endereco: "Av. E, 202", email: "carlos@email.com", telefone: "11955555555" },
        { nome: "Julia Ferreira", endereco: "Rua F, 303", email: "julia@email.com", telefone: "11944444444" },
        { nome: "Lucas Alves", endereco: "Av. G, 404", email: "lucas@email.com", telefone: "11933333333" },
        { nome: "Beatriz Lima", endereco: "Rua H, 505", email: "beatriz@email.com", telefone: "11922222222" },
        { nome: "Felipe Rocha", endereco: "Av. I, 606", email: "felipe@email.com", telefone: "11911111111" },
        { nome: "Camila Souza", endereco: "Rua J, 707", email: "camila@email.com", telefone: "11900000000" },
      ];

      for (const usuario of usuarios) {
        await connection.execute(
          "INSERT INTO usuarios (nome, endereco, email, telefone) VALUES (?, ?, ?, ?)",
          [usuario.nome, usuario.endereco, usuario.email, usuario.telefone]
        );
      }

      return res.status(200).json({
        message: "Banco populado com sucesso!",
        livros_inseridos: livros.length,
        usuarios_inseridos: usuarios.length,
      });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao popular banco de dados", details: error.message });
    }
  });

  return router;
}
