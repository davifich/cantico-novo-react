
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Caminho para a pasta de assets
const assetsDir = path.resolve(process.cwd(), 'assets', 'db');

// Garante que o diretório de assets exista
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// O caminho para o banco de dados agora aponta para dentro da pasta de assets
const dbPath = path.resolve(assetsDir, 'cantico-novo.db');

const db = new Database(dbPath);

export interface Song {
  id?: number;
  title?: string;
  letra?: string;
  category_ids?: number[];
  code?: string;
  author?: string;
  artist?: string;
  cifra?: string;
  file_path?: string;
  has_cifra?: boolean;
  has_partitura?: boolean;
}

export interface Category {
  id?: number;
  name: string;
  color: string;
}

export async function initDatabase() {
  console.log('Node DB: Verificando e inicializando tabelas...');

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      artist TEXT,
      letra TEXT,
      cifra TEXT,
      file_path TEXT,
      has_cifra BOOLEAN NOT NULL DEFAULT 0,
      has_partitura BOOLEAN NOT NULL DEFAULT 0,
      code TEXT UNIQUE
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

export async function addCategory(category: Category): Promise<number> {
  try {
    console.log(`Node DB: Adicionando categoria '${category.name}'...`);
    const stmt = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)');
    const info = stmt.run(category.name, category.color);
    console.log(`Node DB: Categoria '${category.name}' adicionada com ID: ${info.lastInsertRowid}`);
    return info.lastInsertRowid as number;
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log(`Node DB: Categoria '${category.name}' já existe.`);
      const stmt = db.prepare('SELECT id FROM categories WHERE name = ?');
      const cat = stmt.get(category.name) as Category;
      return cat.id!;
    } else {
      throw error;
    }
  }
}

export async function addSong(song: Song): Promise<number> {
  const { title, letra, code, author, category_ids } = song;

  if (code) {
    const existingSongStmt = db.prepare('SELECT id FROM songs WHERE code = ?');
    const existingSong = existingSongStmt.get(code);

    if (existingSong) {
      console.log(`Node DB: Atualizando música com código '${code}'...`);
      const updateStmt = db.prepare(
        'UPDATE songs SET title = ?, letra = ?, artist = ? WHERE id = ?'
      );
      updateStmt.run(title, letra, author || null, (existingSong as any).id);
      return (existingSong as any).id;
    }
  }

  console.log(`Node DB: Inserindo nova música '${title || 'Sem Título'}'...`);
  const insertStmt = db.prepare(
    'INSERT INTO songs (title, letra, code, artist) VALUES (?, ?, ?, ?)'
  );
  const info = insertStmt.run(title, letra, code || null, author || null);
  const songId = info.lastInsertRowid as number;

  if (category_ids && category_ids.length > 0) {
    const insertRelationStmt = db.prepare('INSERT INTO song_categories (song_id, category_id) VALUES (?, ?)');
    for (const categoryId of category_ids) {
      try {
        insertRelationStmt.run(songId, categoryId);
      } catch (error: any) {
        if (error.code !== 'SQLITE_CONSTRAINT_PRIMARYKEY') {
          throw error;
        }
      }
    }
  }

  console.log(`Node DB: Música '${title || 'Sem Título'}' inserida com ID: ${songId}`);
  return songId;
}
