/**
 * Analisa uma string no formato LRC e a converte em um array de objetos de letra.
 * Cada objeto contém o tempo (em segundos) e o texto da linha.
 * @param {string} lrcString - A string completa do arquivo LRC.
 * @returns {Array<{time: number, text: string}>} - Um array de objetos de letra.
 */
const parseLRC = (lrcString) => {
  if (!lrcString) {
    return [];
  }

  const lines = lrcString.split('\n');
  const lyrics = [];

  for (const line of lines) {
    const match = line.match(/^\s*\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);

    if (match) {
      const [, minutes, seconds, milliseconds, text] = match;
      const time = 
        parseInt(minutes, 10) * 60 + 
        parseInt(seconds, 10) + 
        parseInt(milliseconds, 10) / 1000;
      
      lyrics.push({
        time,
        text: text.trim(),
      });
    }
  }

  return lyrics;
};

const lrcService = {
  parseLRC,
};

export default lrcService;
