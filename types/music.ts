
// @/types/music.ts

/**
 * Representa uma categoria para organizar as músicas.
 */
export interface Category {
  id: number;
  name: string;
  color: string; // Cor em formato hexadecimal (ex: '#FF5733')
}

/**
 * Representa a estrutura completa de um objeto de música no banco de dados e na aplicação.
 */
export interface Music {
  id: number;
  title: string;
  artist?: string;
  status?: 'synced' | 'pending' | 'error';

  // O conteúdo principal da música
  letra: string | null;
  cifra: string | null;
  file_path: string | null; // Caminho para o arquivo PDF original, se houver

  // Flags para controle de UI
  has_cifra: boolean;
  has_partitura: boolean;

  // Relacionamento com Categorias
  category_ids: number[]; // Array de IDs das categorias associadas
}

/**
 * DTO (Data Transfer Object) para adicionar uma nova música.
 * Usado para garantir que os dados corretos sejam passados para a função de criação.
 */
export interface AddSongDTO {
  title: string;
  artist?: string;
  letra: string | null;
  cifra: string | null;
  file_path?: string | null;
  category_ids?: number[]; // IDs das categorias para associar à música
  has_cifra: boolean;      // Flag indicando se a música tem cifras
  has_partitura: boolean;  // Flag indicando se a música tem partitura em PDF
}
