import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import mammoth from 'mammoth';
import { decode } from 'base-64';
import { v4 as uuidv4 } from 'uuid';

import { analyzeTextContent } from '../lib/music-analyzer';
import { useApp } from '../contexts/AppContext';
import Colors from '../constants/colors';

/**
 * Wrapper simples e compatível com Expo SDK 54.
 * - evita referências a tipos removidos pelo pacote
 * - implementa `copyFile` via read/write base64 (substitui copyAsync)
 */
const FS = {
  readAsStringAsync: async (uri: string, opts?: { encoding?: 'utf8' | 'base64' }) =>
    await FileSystem.readAsStringAsync(uri, (opts as any) ?? undefined),

  writeAsStringAsync: async (uri: string, data: string, opts?: { encoding?: 'utf8' | 'base64' }) =>
    await FileSystem.writeAsStringAsync(uri, data, (opts as any) ?? undefined),

  makeDirectoryAsync: async (dir: string, opts?: { intermediates?: boolean }) =>
    await FileSystem.makeDirectoryAsync(dir, (opts as any) ?? undefined),

  documentDirectory: FileSystem.documentDirectory ?? '',

  // copyFile: lê como base64 e escreve como base64 (compatível com expo-file-system v19)
  copyFile: async (from: string, to: string) => {
    const data = await FileSystem.readAsStringAsync(from, { encoding: 'base64' } as any);
    await FileSystem.writeAsStringAsync(to, data, { encoding: 'base64' } as any);
  },
};

// Função para converter Base64 para ArrayBuffer (necessária para mammoth)
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = decode(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

interface AnalysisState {
  letra: string | null;
  cifra: string | null;
  has_cifra: boolean;
}

export default function VerifyImportScreen() {
  const params = useLocalSearchParams<{ uri?: string; name?: string; mimeType?: string }>();
  const { isDarkMode, addSong } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [isPartitura, setIsPartitura] = useState(false);

  const isPdf = useMemo(() => params?.mimeType === 'application/pdf', [params?.mimeType]);

  useEffect(() => {
    const processFile = async () => {
      try {
        if (!params?.uri) return;

        let rawText = '';

        if (
          params?.mimeType ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          // Ler .docx como base64, converter para ArrayBuffer e extrair texto com mammoth
          const base64 = await FS.readAsStringAsync(params.uri, { encoding: 'base64' });
          const arrayBuffer = base64ToArrayBuffer(base64);
          const mammothResult = await mammoth.extractRawText({ arrayBuffer });
          rawText = mammothResult?.value ?? '';
        } else if (isPdf) {
          // Placeholder para PDF (você pode trocar por extração real se adicionar lib)
          rawText = `(Texto extraído do PDF: ${params?.name ?? 'arquivo.pdf'})\n\n[G]Amazing [C]grace, how [G]sweet the [D]sound`;
        } else {
          // Fallback: tentar ler como texto utf8
          try {
            rawText = await FS.readAsStringAsync(params.uri, { encoding: 'utf8' });
          } catch {
            rawText = '';
          }
        }

        const analysisResult = analyzeTextContent(rawText);
        setAnalysis(analysisResult);
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        Alert.alert('Erro de Análise', 'Não foi possível analisar o conteúdo do arquivo.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    processFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.uri, params?.mimeType, isPdf]);

  const handleConfirmImport = useCallback(async () => {
    if (!analysis) return;

    try {
      setIsLoading(true);
      let filePath: string | null = null;

      if (isPartitura && isPdf && params?.uri) {
        const dir = FS.documentDirectory + 'partituras/';
        await FS.makeDirectoryAsync(dir, { intermediates: true });

        const newFileName = `${uuidv4()}.pdf`;
        filePath = `${dir}${newFileName}`;

        // substitui copyAsync (removido) por copyFile implementado
        await FS.copyFile(params.uri, filePath);
      }

      const songId = await addSong({
        title: params?.name?.replace(/\.(docx|pdf)$/i, '') || 'Nova Música',
        letra: analysis.letra,
        cifra: analysis.cifra,
        file_path: filePath,
        has_cifra: analysis.has_cifra,
        has_partitura: isPartitura && isPdf,
        category_ids: [],
      });

      if (songId) {
        Alert.alert('Sucesso!', 'A música foi importada para o seu repertório.', [
          { text: 'Ver Música', onPress: () => router.replace(`/song/${songId}`) },
          { text: 'OK', style: 'cancel', onPress: () => router.back() },
        ]);
      } else {
        throw new Error('Falha ao obter ID da música após inserção.');
      }
    } catch (error) {
      console.error('Erro ao salvar música:', error);
      Alert.alert('Erro ao Salvar', 'Não foi possível salvar a música no banco de dados.');
    } finally {
      setIsLoading(false);
    }
  }, [analysis, isPartitura, isPdf, params?.uri, params?.name, addSong]);

  if (isLoading || !analysis) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, justifyContent: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Analisando arquivo...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Verificação de Importação</Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Análise do Conteúdo</Text>
          {analysis.has_cifra ? (
            <Text style={[styles.analysisText, { color: colors.success }]}>✓ Cifras detectadas</Text>
          ) : (
            <Text style={[styles.analysisText, { color: colors.textSecondary }]}>
              Nenhuma cifra detectada
            </Text>
          )}
          <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Prévia da letra:</Text>
          <Text style={[styles.previewText, { color: colors.text }]} numberOfLines={5}>
            {analysis.letra}
          </Text>
        </View>

        {isPdf && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Natureza do Arquivo</Text>
            <Text style={[styles.question, { color: colors.textSecondary }]}>
              Este arquivo PDF é uma partitura musical que você deseja salvar?
            </Text>

            <TouchableOpacity
              style={styles.toggleContainer}
              onPress={() => setIsPartitura(!isPartitura)}
            >
              <View style={[styles.checkbox, { borderColor: colors.primary }]}>
                {isPartitura && (
                  <View
                    style={[styles.checkboxInner, { backgroundColor: colors.primary }]}
                  />
                )}
              </View>
              <Text style={[styles.toggleText, { color: colors.text }]}>Sim, é uma partitura</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: colors.primary }]}
          onPress={handleConfirmImport}
        >
          <Text style={styles.confirmButtonText}>Concluir Importação</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  loadingText: { marginTop: 16, fontSize: 16, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  card: { borderRadius: 12, padding: 16, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  analysisText: { fontSize: 16, fontWeight: '500', marginBottom: 12 },
  previewLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  previewText: { fontFamily: 'monospace', fontSize: 14, lineHeight: 20 },
  question: { fontSize: 16, marginBottom: 16, lineHeight: 22 },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checkboxInner: { width: 14, height: 14, borderRadius: 2 },
  toggleText: { fontSize: 16, fontWeight: '600' },
  confirmButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  confirmButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { padding: 16, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '500' },
});
