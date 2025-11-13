
import Database from 'better-sqlite3';
import path from 'path';

// O caminho para o banco de dados deve ser o mesmo usado pelo Expo
// Assumindo que o banco está em 'db/cantico-novo.db' a partir da raiz do projeto
const dbPath = path.resolve(process.cwd(), 'db', 'cantico-novo.db');

// Garante que o diretório do banco de dados exista
import fs from 'fs';
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Interface flexível para aceitar os dados de origem
export interface Song {
  id?: number;
  title?: string; // Opcional
  lyrics?: string; // Opcional
  letra?: string; // Opcional, para compatibilidade
  category_ids?: number[];
  code?: string;
  author?: string;
}

export interface Category {
  id?: number;
  name: string;
}

// Função para inicializar o banco de dados (cria as tabelas se não existirem)
export async function initDatabase() {
  console.log('Node DB: Verificando e inicializando tabelas...');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `);

  // Removemos a restrição NOT NULL de title e lyrics
  db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      lyrics TEXT,
      code TEXT,
      author TEXT
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS song_categories (
      song_id INTEGER,
      category_id INTEGER,
      FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
      PRIMARY KEY (song_id, category_id)
    );
  `);

  console.log('Node DB: Tabelas verificadas/criadas com sucesso.');
}

// Função para adicionar uma categoria
export async function addCategory(category: Category): Promise<number> {
  try {
    console.log(`Node DB: Adicionando categoria '${category.name}'...`);
    const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
    const info = stmt.run(category.name);
    console.log(`Node DB: Categoria '${category.name}' adicionada com ID: ${info.lastInsertRowid}`);
    return info.lastInsertRowid as number;
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log(`Node DB: Categoria '${category.name}' já existe.`);
      // Se já existe, busca o ID da categoria existente
      const stmt = db.prepare('SELECT id FROM categories WHERE name = ?');
      const cat = stmt.get(category.name) as Category;
      return cat.id!;
    } else {
      throw error;
    }
  }
}

// Função para adicionar uma música, agora mais flexível
export async function addSong(song: Song): Promise<number> {
  // Usa song.letra se song.lyrics não estiver disponível
  const lyrics = song.lyrics || song.letra;
  const { title, code, author, category_ids } = song;

  // Lógica de UPSERT para músicas baseada no 'code'
  if (code) {
    const existingSongStmt = db.prepare('SELECT id FROM songs WHERE code = ?');
    const existingSong = existingSongStmt.get(code);

    if (existingSong) {
      console.log(`Node DB: Atualizando música com código '${code}'...`);
      const updateStmt = db.prepare(
        'UPDATE songs SET title = ?, lyrics = ?, author = ? WHERE id = ?'
      );
      updateStmt.run(title, lyrics, author || null, (existingSong as any).id);
      return (existingSong as any).id;
    }
  }

  console.log(`Node DB: Inserindo nova música '${title || 'Sem Título'}'...`);
  const insertStmt = db.prepare(
    'INSERT INTO songs (title, lyrics, code, author) VALUES (?, ?, ?, ?)'
  );
  const info = insertStmt.run(title, lyrics, code || null, author || null);
  const songId = info.lastInsertRowid as number;

  if (category_ids && category_ids.length > 0) {
    const insertRelationStmt = db.prepare('INSERT INTO song_categories (song_id, category_id) VALUES (?, ?)');
    for (const categoryId of category_ids) {
        try {
            insertRelationStmt.run(songId, categoryId);
        } catch (error: any) {
            if (error.code !== 'SQLITE_CONSTRAINT_PRIMARYKEY') {
                throw error; // Lança o erro se não for uma violação de chave primária
            }
        }
    }
  }

  console.log(`Node DB: Música '${title || 'Sem Título'}' inserida com ID: ${songId}`);
  return songId;
}
