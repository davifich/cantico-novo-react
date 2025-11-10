
// types/music.ts

export interface Category {
  id: string;
  name: string;
  color: string;
  status?: 'synced' | 'pending';
  createdAt?: string;
  updatedAt?: string;
}

export interface Music {
  id: number;
  title: string;
  artist?: string;
  letra?: string;
  cifra?: string;
  // CORREÇÃO: As categorias em uma música são armazenadas apenas como uma lista de nomes.
  categories?: string[]; 
  status?: 'synced' | 'pending';
  createdAt?: string;
  updatedAt?: string;
  type?: 'letra' | 'cifra' | 'partitura';
  file_path?: string;
}

export type ContentType = 'letra' | 'cifra' | 'partitura';
