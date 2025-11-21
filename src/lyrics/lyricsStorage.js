import AsyncStorage from '@react-native-async-storage/async-storage';

const LYRICS_STORAGE_PREFIX = '@KaraokeApp:lyrics-';

/**
 * Salva a letra de uma música de forma persistente.
 * @param {string} trackId - O identificador único da música.
 * @param {string} lyrics - A nova letra da música.
 * @returns {Promise<{success: boolean}>}
 */
const saveLyrics = async (trackId, lyrics) => {
  try {
    const key = `${LYRICS_STORAGE_PREFIX}${trackId}`;
    await AsyncStorage.setItem(key, lyrics);
    console.log(`Letra para a música ID ${trackId} salva com sucesso.`);
    return { success: true };
  } catch (e) {
    console.error('Falha ao salvar a letra no AsyncStorage.', e);
    return { success: false };
  }
};

/**
 * Recupera a letra de uma música do armazenamento persistente.
 * @param {string} trackId - O identificador único da música.
 * @returns {Promise<{lyrics: string | null}>}
 */
const getLyrics = async (trackId) => {
  try {
    const key = `${LYRICS_STORAGE_PREFIX}${trackId}`;
    const lyrics = await AsyncStorage.getItem(key);
    return { lyrics };
  } catch (e) {
    console.error('Falha ao recuperar a letra do AsyncStorage.', e);
    return { lyrics: null };
  }
};

const lyricsStorage = {
  saveLyrics,
  getLyrics,
};

export default lyricsStorage;
