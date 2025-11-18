
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { AddSongDTO, UpdateSongDTO } from '../types/music';

const assetsDir = path.resolve(process.cwd(), 'assets', 'db');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

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

export function initDatabase() {
  console.log('Node DB: Verificando e inicializando tabelas...');

  db.exec(`PRAGMA foreign_keys = ON;`);

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

export function addCategory(category: Category): number {
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

export function addSong(song: AddSongDTO): number {
  const transaction = db.transaction((songData: AddSongDTO) => {
    const insertStmt = db.prepare(
      'INSERT INTO songs (title, artist, code, letra, cifra, file_path, has_cifra, has_partitura) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const info = insertStmt.run(
      songData.title,
      songData.artist || null,
      songData.code || null,
      songData.letra || null,
      songData.cifra || null,
      songData.file_path || null,
      songData.has_cifra ? 1 : 0,
      songData.has_partitura ? 1 : 0
    );
    const songId = info.lastInsertRowid as number;

    if (songData.category_ids && songData.category_ids.length > 0) {
      const insertRelationStmt = db.prepare('INSERT INTO song_categories (song_id, category_id) VALUES (?, ?)');
      for (const categoryId of songData.category_ids) {
        insertRelationStmt.run(songId, categoryId);
      }
    }
    return songId;
  });

  return transaction(song);
}

export function updateSongInDb(id: number, song: UpdateSongDTO): void {
    const transaction = db.transaction((songId: number, songData: UpdateSongDTO) => {
        const currentSongStmt = db.prepare('SELECT * FROM songs WHERE id = ?');
        const currentSong = currentSongStmt.get(songId) as Song | undefined;
        if (!currentSong) {
            throw new Error(`Música com ID ${songId} não encontrada.`);
        }

        const dataToUpdate = {
            title: songData.title !== undefined ? songData.title : currentSong.title,
            artist: songData.artist !== undefined ? songData.artist : currentSong.artist,
            letra: songData.letra !== undefined ? songData.letra : currentSong.letra,
            cifra: songData.cifra !== undefined ? songData.cifra : currentSong.cifra,
            has_cifra: songData.has_cifra !== undefined ? (songData.has_cifra ? 1 : 0) : (currentSong.has_cifra ? 1 : 0),
            has_partitura: songData.has_partitura !== undefined ? (songData.has_partitura ? 1 : 0) : (currentSong.has_partitura ? 1 : 0),
        }

        const updateStmt = db.prepare(
            `UPDATE songs 
             SET title = @title, artist = @artist, letra = @letra, cifra = @cifra, has_cifra = @has_cifra, has_partitura = @has_partitura
             WHERE id = @id`
        );
        updateStmt.run({ ...dataToUpdate, id: songId });

        if (songData.category_ids) {
            const deleteCategoriesStmt = db.prepare('DELETE FROM song_categories WHERE song_id = ?');
            deleteCategoriesStmt.run(songId);

            const insertRelationStmt = db.prepare('INSERT INTO song_categories (song_id, category_id) VALUES (?, ?)');
            for (const categoryId of songData.category_ids) {
                insertRelationStmt.run(songId, categoryId);
            }
        }
    });

    transaction(id, song);
}

export function generateNextPersonalizedCode(): string {
    const stmt = db.prepare("SELECT code FROM songs WHERE code LIKE 'P%'");
    const personalizedSongs = stmt.all() as { code: string }[];

    let maxNumber = 0;
    if (personalizedSongs && personalizedSongs.length > 0) {
        for (const song of personalizedSongs) {
            if (song.code) {
                const numberPart = parseInt(song.code.substring(1), 10);
                if (!isNaN(numberPart) && numberPart > maxNumber) {
                    maxNumber = numberPart;
                }
            }
        }
    }

    return `P${maxNumber + 1}`;
}
