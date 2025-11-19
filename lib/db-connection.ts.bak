import * as FileSystem from 'expo-file-system/legacy';
import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';

const DB_NAME = 'cantico-novo.db';

let db: SQLite.SQLiteDatabase | null = null;

async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  const sqliteDirectory = `${FileSystem.documentDirectory}SQLite`;
  const dbPath = `${sqliteDirectory}/${DB_NAME}`;

  // Use a API legada para verificar se o arquivo de banco de dados já existe
  const dbInfo = await FileSystem.getInfoAsync(dbPath);

  if (!dbInfo.exists) {
    // Garante que o diretório SQLite exista
    await FileSystem.makeDirectoryAsync(sqliteDirectory, { intermediates: true });

    // Resolve o asset do banco de dados a partir do require
    const asset = Asset.fromModule(require('../assets/db/cantico-novo.db'));
    
    // Baixa o asset para o cache do aplicativo
    await asset.downloadAsync();
    
    // A propriedade localUri agora aponta para o arquivo no cache
    if (!asset.localUri) {
      throw new Error('Falha ao carregar o asset do banco de dados: a URI local é nula.');
    }
    
    // Copia o banco de dados do cache para o diretório final
    await FileSystem.copyAsync({
      from: asset.localUri,
      to: dbPath,
    });
  }

  // Agora que o arquivo está garantidamente no lugar, abra o banco de dados
  db = await SQLite.openDatabaseAsync(DB_NAME);
  return db;
}

export { getDB };