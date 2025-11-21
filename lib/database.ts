
import { getDB } from './db-connection';
import { AddSongDTO, Category, Music, UpdateSongDTO } from '../types/music';

type Bindable = string | number | null;
function toBindable(value: unknown): Bindable {
  if (value === undefined || value === null) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') return value;
  return String(value);
}

export async function initDatabase(): Promise<void> {
  try {
    const db = await getDB();
    await db.execAsync('PRAGMA foreign_keys = ON;');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artist TEXT,
        letra TEXT,
        cifra TEXT,
        file_path TEXT,
        has_cifra INTEGER NOT NULL DEFAULT 0,
        has_partitura INTEGER NOT NULL DEFAULT 0,
        code TEXT UNIQUE,
        last_played INTEGER
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
    const versionResult = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
    let currentVersion = versionResult?.user_version ?? 0;
    if (currentVersion < 1) {
      const cols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(songs);');
      if (!cols.some(c => c.name === 'code')) {
        await db.execAsync('ALTER TABLE songs ADD COLUMN code TEXT UNIQUE;');
      }
      await db.execAsync('PRAGMA user_version = 1;');
      currentVersion = 1;
    }
    if (currentVersion < 2) {
      const cols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(songs);');
      if (!cols.some(c => c.name === 'last_played')) {
        await db.execAsync('ALTER TABLE songs ADD COLUMN last_played INTEGER;');
      }
      await db.execAsync('PRAGMA user_version = 2;');
      currentVersion = 2;
    }
    // Versão 3: Adicionando campos de Karaokê
    if (currentVersion < 3) {
        const cols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(songs);');
        if (!cols.some(c => c.name === 'is_karaoke')) {
          await db.execAsync('ALTER TABLE songs ADD COLUMN is_karaoke INTEGER NOT NULL DEFAULT 0;');
        }
        if (!cols.some(c => c.name === 'audio_uri')) {
          await db.execAsync('ALTER TABLE songs ADD COLUMN audio_uri TEXT;');
        }
        if (!cols.some(c => c.name === 'bpm')) {
          await db.execAsync('ALTER TABLE songs ADD COLUMN bpm REAL;');
        }
        if (!cols.some(c => c.name === 'lyrics_karaoke')) {
          await db.execAsync('ALTER TABLE songs ADD COLUMN lyrics_karaoke TEXT;');
        }
        await db.execAsync('PRAGMA user_version = 3;');
        currentVersion = 3;
      }
  } catch (error) {
    throw new Error(`Falha ao inicializar banco de dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<Category>('SELECT * FROM categories ORDER BY name ASC;');
  return rows.map(r => ({ ...r }));
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<number> {
  const db = await getDB();
  const res = await db.runAsync('INSERT INTO categories (name, color) VALUES (?, ?)', [
    toBindable(category.name),
    toBindable(category.color)
  ]);
  return typeof res.lastInsertRowId === 'number' ? res.lastInsertRowId : Number(res.lastInsertRowId);
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM categories WHERE id = ?', [toBindable(id)]);
}

// Função Auxiliar para Mapear Músicas
const mapSongs = (songs: any[], relations: any[]): Music[] => {
    const map = new Map<number, number[]>();
    for (const r of relations) {
      if (!map.has(r.song_id)) map.set(r.song_id, []);
      map.get(r.song_id)!.push(r.category_id);
    }
    return songs.map((s: any) => ({
      id: s.id,
      title: s.title,
      artist: s.artist ?? null,
      status: (s as any).status ?? undefined,
      code: s.code ?? undefined,
      letra: s.letra ?? null,
      cifra: s.cifra ?? null,
      file_path: s.file_path ?? null,
      has_cifra: !!s.has_cifra,
      has_partitura: !!s.has_partitura,
      last_played: typeof s.last_played === 'number' ? s.last_played : null,
      category_ids: map.get(s.id) || [],
      is_karaoke: !!s.is_karaoke,
      audio_uri: s.audio_uri ?? null,
      bpm: typeof s.bpm === 'number' ? s.bpm : null,
      lyrics_karaoke: s.lyrics_karaoke ? JSON.parse(s.lyrics_karaoke) : null,
    } as Music));
};
  
export async function getAllSongs(): Promise<Music[]> {
  const db = await getDB();
  const songs = await db.getAllAsync<any>('SELECT * FROM songs ORDER BY title ASC;');
  const relations = await db.getAllAsync<{ song_id: number; category_id: number }>('SELECT * FROM song_categories;');
  return mapSongs(songs, relations);
}

// NOVA FUNÇÃO para buscar apenas músicas de karaokê
export async function getAllKaraokeSongs(): Promise<Music[]> {
    const db = await getDB();
    const songs = await db.getAllAsync<any>('SELECT * FROM songs WHERE is_karaoke = 1 ORDER BY title ASC;');
    const songIds = songs.map(s => s.id);
    if (songIds.length === 0) return [];
    const placeholders = songIds.map(() => '?').join(',');
    const relations = await db.getAllAsync<{ song_id: number; category_id: number }>(`SELECT * FROM song_categories WHERE song_id IN (${placeholders});`, songIds);
    return mapSongs(songs, relations);
}

export async function addSong(song: AddSongDTO): Promise<number> {
  const db = await getDB();
  let newId: number | null = null;
  await db.withTransactionAsync(async () => {
    const res = await db.runAsync(
      `INSERT INTO songs
        (title, artist, code, letra, cifra, file_path, has_cifra, has_partitura, is_karaoke, audio_uri, bpm, lyrics_karaoke)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        toBindable(song.title),
        toBindable(song.artist ?? null),
        toBindable(song.code ?? null),
        toBindable(song.letra ?? null),
        toBindable(song.cifra ?? null),
        toBindable(song.file_path ?? null),
        toBindable(!!song.has_cifra),
        toBindable(!!song.has_partitura),
        toBindable(song.is_karaoke ?? false),
        toBindable(song.audio_uri ?? null),
        toBindable(song.bpm ?? null),
        toBindable(song.lyrics_karaoke ? JSON.stringify(song.lyrics_karaoke) : null),
      ]
    );
    newId = typeof res.lastInsertRowId === 'number' ? res.lastInsertRowId : Number(res.lastInsertRowId);
    const ids = Array.isArray(song.category_ids) ? song.category_ids : [];
    if (newId && ids.length) {
      for (const cid of ids) {
        if (typeof cid !== 'number' || !Number.isFinite(cid)) continue;
        await db.runAsync('INSERT OR IGNORE INTO song_categories (song_id, category_id) VALUES (?, ?)', [
          toBindable(newId),
          toBindable(cid)
        ]);
      }
    }
  });
  if (!newId) throw new Error('Falha ao criar música: ID não retornado.');
  return newId;
}

export async function updateSongInDb(id: number, data: UpdateSongDTO): Promise<void> {
  const db = await getDB();
  const allowed = new Set(['title','artist','code','letra','cifra','file_path','has_cifra','has_partitura','last_played', 'is_karaoke', 'audio_uri', 'bpm', 'lyrics_karaoke']);
  const fields: string[] = [];
  const binds: Bindable[] = [];
  for (const k of Object.keys(data) as (keyof UpdateSongDTO)[]) {
    if (k === 'category_ids') continue;
    if (!allowed.has(String(k))) continue;
    let v = data[k] as unknown;
    if (v === undefined) continue;

    if (k === 'lyrics_karaoke' && v) {
      v = JSON.stringify(v);
    }

    fields.push(`${String(k)} = ?`);
    binds.push(toBindable(v));
  }
  await db.withTransactionAsync(async () => {
    if (fields.length) {
      await db.runAsync(`UPDATE songs SET ${fields.join(', ')} WHERE id = ?`, [...binds, toBindable(id)]);
    }
    if (data.category_ids !== undefined) {
      const ids = Array.isArray(data.category_ids) ? data.category_ids : [];
      await db.runAsync('DELETE FROM song_categories WHERE song_id = ?', [toBindable(id)]);
      for (const cid of ids) {
        if (typeof cid !== 'number' || !Number.isFinite(cid)) continue;
        await db.runAsync('INSERT OR IGNORE INTO song_categories (song_id, category_id) VALUES (?, ?)', [
          toBindable(id),
          toBindable(cid)
        ]);
      }
    }
  });
}

export async function deleteSong(id: number): Promise<void> {
  const db = await getDB();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM song_categories WHERE song_id = ?', [toBindable(id)]);
    await db.runAsync('DELETE FROM songs WHERE id = ?', [toBindable(id)]);
  });
}

export async function addSongToCategory(songId: number, categoryId: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('INSERT OR IGNORE INTO song_categories (song_id, category_id) VALUES (?, ?)', [
    toBindable(songId),
    toBindable(categoryId)
  ]);
}

export async function removeSongFromCategory(songId: number, categoryId: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM song_categories WHERE song_id = ? AND category_id = ?', [
    toBindable(songId),
    toBindable(categoryId)
  ]);
}

export async function getPreference(key: string): Promise<string | null> {
  const db = await getDB();
  const res = await db.getFirstAsync<{ value: string }>('SELECT value FROM user_preferences WHERE key = ?', [
    toBindable(key)
  ]);
  return res?.value ?? null;
}

export async function setPreference(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
  await db.runAsync('INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)', [
    toBindable(key),
    toBindable(valueStr)
  ]);
}

export async function generateNextPersonalizedCode(): Promise<string> {
  const db = await getDB();
  const rows = await db.getAllAsync<{ code: string }>("SELECT code FROM songs WHERE code LIKE 'P%';");
  let max = 0;
  for (const r of rows) {
    if (!r.code) continue;
    const n = parseInt(r.code.substring(1), 10);
    if (!isNaN(n) && n > max) max = n;
  }
  return `P${max + 1}`;
}

// FUNÇÃO DE NORMALIZAÇÃO
const normalizeLyricsForSignature = (lyrics: any): string => {
  if (!lyrics) return '';
  // Se for uma string (letra simples), usa ela.
  // Se for um array (karaokê), junta o texto de todas as linhas.
  const fullText = Array.isArray(lyrics) 
    ? lyrics.map(line => line.text || '').join(' ') 
    : String(lyrics);

  return fullText
    .toLowerCase()
    .normalize('NFD') // Remove acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ') // Remove tudo que não é letra, número ou espaço
    .replace(/\s+/g, ' ') // Remove espaços extras
    .trim();
};

// NOVA FUNÇÃO DE BUSCA POR ASSINATURA
export async function findSongByLyricsSignature(lyrics: any): Promise<Music | null> {
  const signatureToFind = normalizeLyricsForSignature(lyrics);
  if (!signatureToFind) return null;

  const allSongs = await getAllSongs(); // Pega todas as músicas

  for (const song of allSongs) {
    // Apenas checa músicas de karaokê que têm letra
    if (song.is_karaoke && song.lyrics_karaoke) {
      const existingSignature = normalizeLyricsForSignature(song.lyrics_karaoke);
      if (existingSignature === signatureToFind) {
        return song; // Encontrou uma correspondência!
      }
    } else if (!song.is_karaoke && song.letra) { // Também checa músicas que não são de karaokê
        const existingSignature = normalizeLyricsForSignature(song.letra);
        if (existingSignature === signatureToFind) {
            return song; // Encontrou uma correspondência!
        }
    }
  }

  return null; // Nenhuma duplicata encontrada
}
