
import { z } from "zod";

/**
 * Schema Zod para validar a criação de uma música.
 */
export const AddSongDTOSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  artist: z.string().optional(),
  code: z.string().optional(),
  letra: z.string().nullable(),
  cifra: z.string().nullable(),
  file_path: z.string().nullable().optional(),
  category_ids: z.array(z.number()).optional(),
  has_cifra: z.boolean(),
  has_partitura: z.boolean(),
});

/**
 * Tipo TypeScript gerado automaticamente a partir do schema.
 */
export type AddSongDTOSchema = z.infer<typeof AddSongDTOSchema>;


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
  code?: string; // Código alfanumérico da música

  // O conteúdo principal da música
  letra: string | null;
  cifra: string | null;
  file_path: string | null; // Caminho para o arquivo PDF original, se houver

  // Flags para controle de UI
  has_cifra: boolean;
  has_partitura: boolean;
  
  // Metadados
  last_played: number | null; // Timestamp da última vez que a música foi tocada

  // Relacionamento com Categorias
  category_ids: number[]; // Array de IDs das categorias associadas

  // --- NOVOS CAMPOS PARA O KARAOKÊ ---
  is_karaoke: boolean;      // Flag para identificar facilmente
  audio_uri: string | null;   // Caminho LOCAL para o arquivo de áudio
  bpm: number | null;         // BPM da transcrição
  lyrics_karaoke: any | null; // A estrutura da letra com timestamps

}

/**
 * DTO (Data Transfer Object) para adicionar uma nova música.
 * Usado para garantir que os dados corretos sejam passados para a função de criação.
 */
export interface AddSongDTO {
  title: string;
  artist?: string;
  code?: string; 
  letra: string | null;
  cifra: string | null;
  file_path?: string | null;
  category_ids?: number[]; 
  has_cifra: boolean;      
  has_partitura: boolean;  

  // Campos de Karaokê
  is_karaoke?: boolean;
  audio_uri?: string | null;
  bpm?: number | null;
  lyrics_karaoke?: any | null;
}

/**
 * DTO (Data Transfer Object) para atualizar uma música existente.
 * Todos os campos são opcionais, permitindo a atualização parcial.
 */
export interface UpdateSongDTO {
    title?: string;
    artist?: string;
    code?: string; 
    letra?: string | null;
    cifra?: string | null;
    category_ids?: number[];
    has_cifra?: boolean;
    has_partitura?: boolean;
    last_played?: number | null;

    // Campos de Karaokê
    is_karaoke?: boolean;
    audio_uri?: string | null;
    bpm?: number | null;
    lyrics_karaoke?: any | null;
}
