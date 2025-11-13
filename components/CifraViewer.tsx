
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

interface CifraViewerProps {
  content: string;
  zoomFactor: number;
}

interface LineSegment {
  chord: string | null;
  text: string;
}

// Esta é a função principal do parser.
// Ela transforma a string bruta em uma estrutura de dados organizada (linhas e segmentos).
const parseContent = (content: string): LineSegment[][] => {
  if (!content) return [];

  return content.split('\n').map(line => {
    // Regex para encontrar acordes e o texto que os segue.
    // Ex: "[G]Amazing [C]grace" -> ["[G]Amazing ", "[C]grace"]
    const segments = line.match(/(\[.*?\][^[]*)/g) || [];

    // Se não houver acordes na linha, trata-a como uma única linha de texto.
    if (segments.length === 0) {
      return [{ chord: null, text: line }];
    }

    return segments.map(segment => {
      const chordMatch = segment.match(/(\[(.*?)\])/);
      const chord = chordMatch ? chordMatch[2] : null;
      const text = segment.replace(/(\[.*?\])/, '');
      return { chord, text };
    });
  });
};

const CifraViewer = ({ content, zoomFactor = 1 }: CifraViewerProps) => {
  const parsedLines = useMemo(() => parseContent(content), [content]);
  const colors = Colors.dark; // Usaremos um tema fixo por enquanto, pode ser prop mais tarde

  return (
    <View style={styles.container}>
      {parsedLines.map((line, lineIndex) => (
        <View key={lineIndex} style={styles.lineContainer}>
          {line.map((segment, segmentIndex) => (
            <View key={segmentIndex} style={styles.segmentContainer}>
              {segment.chord && (
                <Text style={[styles.chord, { color: colors.primary, fontSize: 14 * zoomFactor }]}>
                  {segment.chord}
                </Text>
              )}
              <Text style={[styles.lyrics, { color: colors.text, fontSize: 16 * zoomFactor, lineHeight: (16 * zoomFactor) * 1.8 }]}>
                {segment.text}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  lineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24, // Espaço entre as linhas de música
  },
  segmentContainer: {
    alignItems: 'flex-start',
    marginRight: 4, // Pequeno espaço entre os segmentos de uma mesma linha
  },
  chord: {
    fontWeight: 'bold',
    marginBottom: 2, // Espaço entre o acorde e a letra
  },
  lyrics: {
    fontWeight: '500',
  },
});

export default CifraViewer;
