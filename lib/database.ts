
import * as SQLite from 'expo-sqlite';
import { AddSongDTO, Category, Music } from '../types/music';

const db = SQLite.openDatabaseSync('app.db');

/**
 * Prepara o banco de dados, criando as tabelas se elas não existirem.
 * Habilita chaves estrangeiras para garantir a integridade dos dados.
 */
export async function initDatabase() {
  await db.execAsync(`PRAGMA foreign_keys = ON;`);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT,
      letra TEXT,
      cifra TEXT,
      file_path TEXT,
      has_cifra BOOLEAN NOT NULL DEFAULT 0,
      has_partitura BOOLEAN NOT NULL DEFAULT 0
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS song_categories (
      song_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      PRIMARY KEY (song_id, category_id),
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );
  `);
}

// === OPERAÇÕES EM CATEGORIAS ===

export async function getAllCategories(): Promise<Category[]> {
  return await db.getAllAsync<Category>('SELECT * FROM categories ORDER BY name ASC;');
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<number> {
  const result = await db.runAsync('INSERT INTO categories (name, color) VALUES (?, ?)', [category.name, category.color]);
  return result.lastInsertRowId;
}

export async function deleteCategory(id: number): Promise<void> {
  await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
}

// === OPERAÇÕES EM MÚSICAS ===

export async function getAllSongs(): Promise<Music[]> {
  const dbSongs = await db.getAllAsync<Omit<Music, 'category_ids'>>('SELECT * FROM songs ORDER BY title ASC;');
  const relations = await db.getAllAsync<{ song_id: number; category_id: number }>('SELECT * FROM song_categories;');
  
  const songCategoryMap = new Map<number, number[]>();
  for (const relation of relations) {
    if (!songCategoryMap.has(relation.song_id)) {
      songCategoryMap.set(relation.song_id, []);
    }
    songCategoryMap.get(relation.song_id)!.push(relation.category_id);
  }

  return dbSongs.map((song) => ({
    ...song,
    has_cifra: !!song.has_cifra,
    has_partitura: !!song.has_partitura,
    category_ids: songCategoryMap.get(song.id) || [],
  }));
}

export async function addSong(song: AddSongDTO): Promise<number> {
  let newSongId: number | null = null;

  await db.withTransactionAsync(async () => {
    const insertResult = await db.runAsync(
      'INSERT INTO songs (title, artist, letra, cifra, file_path, has_cifra, has_partitura) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        song.title, song.artist || null, song.letra || null, song.cifra || null,
        song.file_path || null, !!song.cifra, !!song.file_path,
      ]
    );
    
    newSongId = insertResult.lastInsertRowId;

    if (song.category_ids && song.category_ids.length > 0) {
      for (const categoryId of song.category_ids) {
        await db.runAsync('INSERT INTO song_categories (song_id, category_id) VALUES (?, ?)', [newSongId, categoryId]);
      }
    }
  });

  if (newSongId === null) {
    throw new Error("Falha ao criar música: ID não foi gerado.");
  }

  return newSongId;
}

export async function deleteSong(id: number): Promise<void> {
  await db.runAsync('DELETE FROM songs WHERE id = ?', [id]);
}

// === OPERAÇÕES NA TABELA DE JUNÇÃO ===

export async function addSongToCategory(songId: number, categoryId: number): Promise<void> {
  await db.runAsync('INSERT INTO song_categories (song_id, category_id) VALUES (?, ?)', [songId, categoryId]);
}

export async function removeSongFromCategory(songId: number, categoryId: number): Promise<void> {
  await db.runAsync('DELETE FROM song_categories WHERE song_id = ? AND category_id = ?', [songId, categoryId]);
}

// === OPERAÇÕES EM PREFERÊNCIAS ===

export async function getPreference(key: string): Promise<string | null> {
  const result = await db.getFirstAsync<{ value: string }>('SELECT value FROM user_preferences WHERE key = ?', [key]);
  return result ? result.value : null;
}

export async function setPreference(key: string, value: any): Promise<void> {
  const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
  await db.runAsync('INSERT INTO user_preferences (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, valueStr]);
}
