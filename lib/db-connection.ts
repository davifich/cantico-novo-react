
import * as SQLite from 'expo-sqlite';

// A variável para armazenar a conexão do banco de dados.
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Retorna a instância do banco de dados, inicializando-a de forma assíncrona e preguiçosa na primeira chamada.
 * Garante que o banco de dados seja aberto apenas uma vez e não bloqueie o thread principal.
 */
export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }
  // Se a conexão ainda não existe, abre-a de forma assíncrona.
  db = await SQLite.openDatabaseAsync('app.db');
  return db;
}
