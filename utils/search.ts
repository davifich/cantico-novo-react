
import { Music } from '../types/music';

/**
 * Normaliza uma string para busca, removendo acentos e convertendo para minúsculas.
 * @param text - O texto a ser normalizado.
 * @returns O texto normalizado.
 */
const normalizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

/**
 * Filtra uma lista de músicas com base em uma query de busca.
 * A busca é feita no título, artista, letra e código da música de forma insensível a acentos e caixa.
 * @param songs - A lista de músicas para filtrar.
 * @param query - O termo de busca.
 * @returns Uma nova lista de músicas que correspondem à busca.
 */
export const filterSongs = (songs: Music[], query: string): Music[] => {
  if (!query.trim()) {
    return [];
  }

  const normalizedQuery = normalizeText(query);

  return songs.filter(song => {
    const normalizedTitle = normalizeText(song.title);
    const normalizedArtist = normalizeText(song.artist);
    const normalizedLyrics = normalizeText(song.letra);
    const songCode = normalizeText(song.code); // Campo que faltava

    return (
      normalizedTitle.includes(normalizedQuery) ||
      normalizedArtist.includes(normalizedQuery) ||
      normalizedLyrics.includes(normalizedQuery) ||
      songCode.includes(normalizedQuery) // Lógica de busca corrigida
    );
  });
};
