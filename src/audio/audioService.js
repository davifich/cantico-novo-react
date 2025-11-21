import { Audio } from 'expo-av';

let sound = null;

// Carrega uma nova faixa de áudio e retorna o objeto de som
const load = async (uri, onPlaybackStatusUpdate) => {
  if (sound) {
    await unload(); // Garante que o som anterior seja descarregado
  }

  try {
    const { sound: newSound, status } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false },
      onPlaybackStatusUpdate
    );
    sound = newSound;
    return { success: true, sound: newSound, duration: status.durationMillis };
  } catch (error) {
    console.error("Falha ao carregar o áudio:", error);
    return { success: false, error };
  }
};

// Reproduz o áudio carregado
const play = async () => {
  if (sound) {
    return await sound.playAsync();
  }
};

// Pausa o áudio em reprodução
const pause = async () => {
  if (sound) {
    return await sound.pauseAsync();
  }
};

// Alterna entre play e pause
const togglePlayback = async () => {
  if (!sound) return;
  const status = await sound.getStatusAsync();
  if (status.isLoaded) {
    if (status.isPlaying) {
      return await pause();
    } else {
      return await play();
    }
  }
};

// Pula para uma posição específica em milissegundos
const setPosition = async (milliseconds) => {
  if (sound) {
    return await sound.setPositionAsync(milliseconds);
  }
};

// Avança ou retrocede o áudio
const skip = async (seconds) => {
  if (!sound) return;
  const status = await sound.getStatusAsync();
  if (status.isLoaded) {
    const newPosition = status.positionMillis + (seconds * 1000);
    const finalPosition = Math.max(0, Math.min(status.durationMillis, newPosition));
    return await setPosition(finalPosition);
  }
};

// Descarrega o áudio da memória
const unload = async () => {
  if (sound) {
    await sound.unloadAsync();
    sound = null;
  }
};

// Retorna o status atual do som
const getStatus = async () => {
  if (sound) {
    return await sound.getStatusAsync();
  }
  return null;
};

const audioService = {
  load,
  play,
  pause,
  togglePlayback, // Agora existe
  skip,           // Agora existe
  setPosition,
  unload,
  getStatus,
};

export default audioService;
