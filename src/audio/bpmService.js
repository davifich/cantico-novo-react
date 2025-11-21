/**
 * Simula a análise de BPM de uma faixa de áudio.
 * No futuro, isso pode ser substituído por uma leitura de metadados
 * ou uma biblioteca de análise de áudio mais complexa e compatível.
 * @param {object} track - O objeto da faixa de música.
 * @returns {Promise<{bpm: number | null}>} - Uma promessa que resolve com o BPM simulado.
 */
const getBpm = async (track) => {
  console.log(`Simulando análise de BPM para: ${track.title}`);
  
  // Simula um pequeno delay de análise
  await new Promise(resolve => setTimeout(resolve, 150));

  // Retorna um valor fixo ou baseado em algum hash simples do título
  const simulatedBpm = 120 + (track.title.length % 10); 

  return { bpm: simulatedBpm };
};

const bpmService = {
  getBpm,
};

export default bpmService;
