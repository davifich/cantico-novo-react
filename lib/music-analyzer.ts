
// Heurística simples para detectar cifras. Pode ser aprimorada no futuro.
const CHORD_REGEX = /\b([A-G][b#]?(m|maj|min|dim|aug|sus|add|\d)*(\s*\/\s*[A-G][b#]?)?)\b/;
const BRACKET_CHORD_REGEX = /\[(.*?)\]/g;

interface AnalysisResult {
  letra: string;
  cifra: string | null;
  has_cifra: boolean;
}

/**
 * Analisa um bloco de texto bruto, extrai a letra pura, detecta a presença de cifras,
 * e separa o conteúdo em letra e cifra.
 * 
 * @param rawText O conteúdo de texto bruto extraído de um arquivo.
 * @returns Um objeto estruturado com a análise do conteúdo.
 */
export function analyzeTextContent(rawText: string): AnalysisResult {
  if (!rawText) {
    return {
      letra: '',
      cifra: null,
      has_cifra: false,
    };
  }

  const lines = rawText.split('\n');
  let chordLineCount = 0;

  // Heurística: se mais de 15% das linhas com texto contiverem algo que parece um acorde,
  // consideramos que o texto tem cifras.
  const nonEmptyLines = lines.filter(line => line.trim().length > 0);
  nonEmptyLines.forEach(line => {
    if (BRACKET_CHORD_REGEX.test(line)) {
      chordLineCount++;
    }
  });

  const has_cifra = nonEmptyLines.length > 0 && (chordLineCount / nonEmptyLines.length) > 0.15;

  if (has_cifra) {
    // Se tem cifras, a "cifra" é o texto original.
    const cifra = rawText;
    // A "letra" é o texto original com os acordes removidos.
    const letra = rawText.replace(BRACKET_CHORD_REGEX, '').replace(/\s{2,}/g, ' ').trim();

    return {
      letra,
      cifra,
      has_cifra: true,
    };
  } else {
    // Se não tem cifras, a "letra" é o próprio texto original.
    return {
      letra: rawText,
      cifra: null,
      has_cifra: false,
    };
  }
}
