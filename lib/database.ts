
import { getDB } from './db-connection';
import { AddSongDTO, Category, Music } from '../types/music';

/**
 * Prepara o banco de dados, criando e migrando tabelas se necessário.
 */
export async function initDatabase() {
  try {
    console.log('[Database] Iniciando inicialização do banco de dados...');
    const db = await getDB();
    
    await db.execAsync(`PRAGMA foreign_keys = ON;`);
    console.log('[Database] Foreign keys habilitadas');

    // Criação das tabelas
    await db.execAsync(`
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
    console.log('[Database] Tabela songs verificada/criada');

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL
      );
    `);
    console.log('[Database] Tabela categories verificada/criada');

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS song_categories (
        song_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        PRIMARY KEY (song_id, category_id),
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );
    `);
    console.log('[Database] Tabela song_categories verificada/criada');

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT
      );
    `);
    console.log('[Database] Tabela user_preferences verificada/criada');

    // Migrações
    const versionResult = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const currentVersion = versionResult ? versionResult.user_version : 0;
    console.log(`[Database] Versão atual do banco: ${currentVersion}`);

    if (currentVersion < 1) {
      console.log('[Database] Executando migração para a versão 1...');
      const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(songs)');
      const columnExists = columns.some(col => col.name === 'code');
      
      if (!columnExists) {
        await db.execAsync('ALTER TABLE songs ADD COLUMN code TEXT UNIQUE');
        console.log('[Database] Coluna "code" adicionada à tabela songs');
      }
      
      await db.execAsync('PRAGMA user_version = 1');
      console.log('[Database] Migração para a versão 1 concluída');
    }

    console.log('[Database] Inicialização concluída com sucesso');
  } catch (error) {
    console.error('[Database] Erro durante inicialização:', error);
    throw new Error(`Falha ao inicializar banco de dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDB();
  return await db.getAllAsync<Category>('SELECT * FROM categories ORDER BY name ASC;');
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<number> {
  const db = await getDB();
  const result = await db.runAsync('INSERT INTO categories (name, color) VALUES (?, ?)', [category.name, category.color]);
  return result.lastInsertRowId;
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
}

export async function getAllSongs(): Promise<Music[]> {
  const db = await getDB();
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
  const db = await getDB();
  let newSongId: number | null = null;

  await db.withTransactionAsync(async () => {
    const insertResult = await db.runAsync(
      'INSERT INTO songs (title, artist, code, letra, cifra, file_path, has_cifra, has_partitura) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        song.title,
        song.artist || null,
        song.code || null,
        song.letra || null,
        song.cifra || null,
        song.file_path || null,
        song.has_cifra,
        song.has_partitura
      ]
    );
    
    newSongId = insertResult.lastInsertRowId;

    if (song.category_ids && song.category_ids.length > 0 && newSongId) {
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
  const db = await getDB();
  await db.runAsync('DELETE FROM songs WHERE id = ?', [id]);
}

export async function addSongToCategory(songId: number, categoryId: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('INSERT INTO song_categories (song_id, category_id) VALUES (?, ?)', [songId, categoryId]);
}

export async function removeSongFromCategory(songId: number, categoryId: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM song_categories WHERE song_id = ? AND category_id = ?', [songId, categoryId]);
}

export async function getPreference(key: string): Promise<string | null> {
  const db = await getDB();
  const result = await db.getFirstAsync<{ value: string }>('SELECT value FROM user_preferences WHERE key = ?', [key]);
  return result ? result.value : null;
}

export async function setPreference(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
  await db.runAsync('INSERT INTO user_preferences (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, valueStr]);
}
