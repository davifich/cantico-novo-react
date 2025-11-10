
// lib/database.ts
import * as SQLite from 'expo-sqlite';
import { Category, Music } from '@/types/music';

const db = SQLite.openDatabaseSync('app.db');

// === FUNÇÕES DE TRANSFORMAÇÃO DE DADOS ===

// Converte um registro da tabela 'songs' para o tipo 'Music' da aplicação.
const transformSongFromDB = (dbSong: any): Music => {
  if (!dbSong) return null as any;
  return {
    id: dbSong.local_id,
    title: dbSong.title,
    artist: dbSong.artist,
    letra: dbSong.content, // Mapeia a coluna 'content' para a propriedade 'letra'
    cifra: dbSong.cifra,
    // CORREÇÃO: Mapeia as novas colunas do banco para as propriedades do tipo Music
    type: dbSong.type,
    file_path: dbSong.file_path,
    categories: dbSong.categories ? JSON.parse(dbSong.categories) : [],
    status: dbSong.status,
    createdAt: dbSong.created_at,
    updatedAt: dbSong.updated_at,
  };
};

// Converte um registro da tabela 'categories' para o tipo 'Category' da aplicação.
const transformCategoryFromDB = (dbCategory: any): Category => {
  if (!dbCategory) return null as any;
  return {
    ...dbCategory,
    id: dbCategory.local_id.toString(), // Converte a chave primária para string
    createdAt: dbCategory.created_at,
  };
};

// === SCHEMA E INICIALIZAÇÃO ===

// Prepara o banco de dados, criando as tabelas se elas não existirem.
export async function initDatabase() {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS songs (
      local_id INTEGER PRIMARY KEY AUTOINCREMENT,
      remote_id TEXT,
      title TEXT NOT NULL,
      artist TEXT,
      content TEXT,
      cifra TEXT,
      categories TEXT,
      type TEXT,
      file_path TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      local_id INTEGER PRIMARY KEY AUTOINCREMENT,
      remote_id TEXT,
      name TEXT NOT NULL UNIQUE,
      color TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT,
      updated_at TEXT NOT NULL
    );
  `);
}

// === CRUD PARA MÚSICAS (SONGS) ===

export async function getAllSongs(): Promise<Music[]> {
  const dbSongs = await db.getAllAsync('SELECT * FROM songs ORDER BY title ASC;');
  return dbSongs.map(transformSongFromDB);
}

export async function addSong(
  song: Partial<Omit<Music, 'id'> & { content?: string }>
) {
  const categoriesString = JSON.stringify(song.categories || []);
  const now = new Date().toISOString();

  const result = await db.runAsync(
    'INSERT INTO songs (title, artist, content, cifra, categories, type, file_path, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      song.title || '',
      song.artist || '',
      song.letra || (song as any).content || '',
      song.cifra || '',
      categoriesString,
      song.type || 'letra',
      song.file_path || null,
      'pending',
      now,
      now,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateSong(local_id: number, data: Partial<Omit<Music, 'id'>>) {
  const fields = Object.keys(data)
    .map(key => {
      if (key === 'letra') return 'content = ?';
      if (key === 'id') return null;
      return `${key} = ?`;
    })
    .filter(Boolean)
    .join(', ');

  if (!fields) return;

  const values = Object.keys(data)
    .map(key => {
      if (key === 'id') return null;
      const value = data[key as keyof typeof data];
      return key === 'categories' ? JSON.stringify(value) : value;
    })
    .filter(v => v !== null);

  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE songs SET ${fields}, updated_at = ?, status = 'pending' WHERE local_id = ?`,
    [...values as SQLite.SQLiteBindValue[], now, local_id]
  );
}

export async function deleteSong(local_id: number) {
  await db.runAsync('DELETE FROM songs WHERE local_id = ?', [local_id]);
}

// === CRUD PARA CATEGORIAS (CATEGORIES) ===

export async function getAllCategories(): Promise<Category[]> {
  const dbCategories = await db.getAllAsync('SELECT * FROM categories ORDER BY name ASC;');
  return dbCategories.map(transformCategoryFromDB);
}

export async function addCategory(category: Pick<Category, 'name' | 'color'>) {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO categories (name, color, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [category.name, category.color, 'pending', now, now]
  );
  return result.lastInsertRowId;
}

export async function updateCategory(local_id: number, data: Partial<Pick<Category, 'name' | 'color'>>) {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE categories SET name = ?, color = ?, updated_at = ?, status = 'pending' WHERE local_id = ?`,
    [data.name || null, data.color || null, now, local_id]
  );
}

export async function deleteCategory(local_id: number) {
  await db.runAsync('DELETE FROM categories WHERE local_id = ?', [local_id]);
}

// === CRUD PARA PREFERÊNCIAS (USER_PREFERENCES) ===

export async function getPreference(key: string): Promise<string | null> {
  const result = await db.getFirstAsync<{ value: string }>('SELECT value FROM user_preferences WHERE key = ?', [key]);
  return result ? result.value : null;
}

export async function setPreference(key: string, value: any) {
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO user_preferences (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
    [key, value, now]
  );
}
