import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let connection;

async function createConnection() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
  }
  return connection;
}

async function initializeDatabase() {
  try {
    const connection = await createConnection();

    console.log("Conexão com o MySQL estabelecida com sucesso.");

    // Criação do banco de dados
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE}\`;`
    );
    console.log(
      `Banco de dados "${process.env.DB_DATABASE}" verificado/criado com sucesso.`
    );

    // Selecionar o banco de dados
    await connection.changeUser({ database: process.env.DB_DATABASE });

    // Criação das tabelas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS livros (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        autor VARCHAR(255) NOT NULL,
        genero VARCHAR(100) NOT NULL,
        ano_publicacao YEAR NOT NULL,
        estoque INT NOT NULL,
        vezes_emprestado INT DEFAULT 0,
        emprestimos_ativos INT DEFAULT 0,
        capa_url VARCHAR(500),
        descricao TEXT
      );
    `);
    // Adiciona colunas se não existirem
    await connection.query(`ALTER TABLE livros ADD COLUMN descricao TEXT NULL;`).catch(()=>{});
    await connection.query(`ALTER TABLE livros ADD COLUMN pdf_url VARCHAR(500) NULL;`).catch(()=>{});

    await connection.query(`
      CREATE TABLE IF NOT EXISTS progresso_leitura (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        livro_id INT NOT NULL,
        ultima_pagina INT DEFAULT 1,
        total_paginas INT DEFAULT 0,
        data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY user_book (usuario_id, livro_id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        endereco VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telefone VARCHAR(15) NOT NULL,
        tipo ENUM('aluno','professor') DEFAULT 'aluno',
        quantidade_emprestimos INT DEFAULT 0,
        emprestimo_ativo BOOLEAN DEFAULT FALSE
      );
    `);
    // Adiciona coluna tipo se não existir (para migração)
    await connection.query(`ALTER TABLE usuarios ADD COLUMN tipo ENUM('aluno','professor') DEFAULT 'aluno';`).catch(()=>{});

    await connection.query(`
      CREATE TABLE IF NOT EXISTS emprestimos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT,
        livro_id INT,
        data_emprestimo DATE,
        data_devolucao DATE,
        devolvido BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (livro_id) REFERENCES livros(id)
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS reservas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT,
        livro_id INT,
        data_reserva DATE,
        status ENUM('ativa', 'cancelada', 'efetivada') DEFAULT 'ativa',
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (livro_id) REFERENCES livros(id)
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS favoritos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        livro_id INT NOT NULL,
        data_adicionado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE,
        UNIQUE KEY unique_favorito (usuario_id, livro_id)
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS avaliacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        livro_id INT NOT NULL,
        nota INT NOT NULL CHECK (nota >= 1 AND nota <= 5),
        comentario TEXT,
        data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE,
        UNIQUE KEY unique_avaliacao (usuario_id, livro_id)
      );
    `);

    console.log("Tabelas verificadas/criadas com sucesso.");
  } catch (error) {
    console.error("Erro na inicialização da base de dados:", error);
  }
}

export { initializeDatabase, createConnection };
