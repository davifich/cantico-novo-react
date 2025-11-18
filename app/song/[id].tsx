
import { Stack, useLocalSearchParams } from 'expo-router';
import { ZoomIn, ZoomOut } from 'lucide-react-native';
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WebView } from 'react-native-webview';

import CifraViewer from '@/components/CifraViewer';
import FloatingFuncMenu from "@/components/FloatingFuncMenu";
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { getPreference, setPreference } from '@/lib/database';
import { Music } from '@/types/music';

const ZOOM_LEVELS = [1, 1.15, 1.3] as const;

type ViewMode = 'letra' | 'cifra' | 'partitura';

const renderFormattedLyrics = (text: string, style: any) => {
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {

    if (line.trim() === '/') {
      return <View key={lineIndex} style={styles.stanzaBreak} />;
    }

    const parts = line.split(/(\*.*?\*)/g);

    return (
      <Text key={lineIndex} style={style}>
        {parts.map((part, partIndex) => {
          if (part.startsWith('*') && part.endsWith('*')) {
            return (
              <Text key={partIndex} style={{ fontWeight: 'bold' }}>
                {part.slice(1, -1)}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  });
};

export default function SongScreen() {
  const { id: idString } = useLocalSearchParams<{ id: string }>();
  const id = useMemo(() => (idString ? parseInt(idString, 10) : NaN), [idString]);

  const { isDarkMode, songs } = useApp();
  const colors = useMemo(() => (isDarkMode ? Colors.dark : Colors.light), [isDarkMode]);

  const [song, setSong] = useState<Music | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>('letra');
  const [zoomLevel, setZoomLevel] = useState(0);

  useEffect(() => {
    const currentSong = songs.find((s) => s.id === id);
    setSong(currentSong);

    if (currentSong) {
      getPreference(`song_${currentSong.id}_viewMode`).then(mode => {
        if (mode === 'cifra' && !currentSong.has_cifra) return setViewMode('letra');
        if (mode === 'partitura' && !currentSong.has_partitura) return setViewMode('letra');
        
        if (mode) {
          setViewMode(mode as ViewMode);
        } else {
          setViewMode(currentSong.letra ? 'letra' : currentSong.has_cifra ? 'cifra' : 'partitura');
        }
      });
    }
  }, [songs, id]);

  const handleSelectMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    if (song) setPreference(`song_${song.id}_viewMode`, mode);
  }, [song]);

  const handleZoomIn = useCallback(() => {
    if (zoomLevel < ZOOM_LEVELS.length - 1) setZoomLevel(z => z + 1);
  }, [zoomLevel]);

  const handleZoomOut = useCallback(() => {
    if (zoomLevel > 0) setZoomLevel(z => z - 1);
  }, [zoomLevel]);

  const displayTitle = useMemo(() => {
    if (!song) return 'Carregando...';
    return song.code ? `${song.code} - ${song.title}` : song.title;
  }, [song]);

  const renderContent = () => {
    if (!song) return null;

    if (viewMode === 'partitura' && song.has_partitura && song.file_path) {
      return <WebView source={{ uri: song.file_path }} style={styles.pdf} />;
    }
    if (viewMode === 'cifra' && song.has_cifra && song.cifra) {
      return <ScrollView><CifraViewer content={song.cifra} zoomFactor={ZOOM_LEVELS[zoomLevel]} /></ScrollView>;
    }
    if (song.letra) {
      return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {song.artist && <Text style={[styles.artist, { color: colors.textSecondary }]}>{song.artist}</Text>}
          {/* Aqui usamos a nova função para renderizar a letra formatada */}
          {renderFormattedLyrics(song.letra, [styles.lyrics, { color: colors.text, fontSize: 16 * ZOOM_LEVELS[zoomLevel] }])}
        </ScrollView>
      );
    }
    return (
      <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhum conteúdo disponível.</Text>
      </View>
    );
  };

  if (!song) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>Carregando música...</Text>
      </View>
    );
  }

  const availableModes = ['letra', song.has_cifra && 'cifra', song.has_partitura && 'partitura'].filter(Boolean) as ViewMode[];

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: displayTitle }} />
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        {availableModes.length > 1 && (
          <View style={[styles.modeSelector, { backgroundColor: colors.surface }]}>
            {availableModes.map(mode => (
              <TouchableOpacity
                key={mode}
                style={[styles.modeButton, viewMode === mode && { backgroundColor: colors.primary }]}
                onPress={() => handleSelectMode(mode)}
              >
                <Text style={[styles.modeButtonText, { color: viewMode === mode ? 'white' : colors.text }]}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {viewMode !== 'partitura' && (
          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut} disabled={zoomLevel === 0}>
              <ZoomOut size={20} color={zoomLevel === 0 ? colors.textLight : colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn} disabled={zoomLevel === ZOOM_LEVELS.length - 1}>
              <ZoomIn size={20} color={zoomLevel === ZOOM_LEVELS.length - 1 ? colors.textLight : colors.text} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>{renderContent()}</View>

      <FloatingFuncMenu />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  modeSelector: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden', flexShrink: 1 },
  modeButton: { paddingHorizontal: 16, paddingVertical: 8 },
  modeButtonText: { fontWeight: 'bold', fontSize: 14 },
  zoomControls: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  zoomButton: { padding: 4 },
  contentContainer: { flex: 1 },
  scrollContent: { padding: 20 },
  pdf: { flex: 1, width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  artist: { fontSize: 16, fontWeight: '600', marginBottom: 20 },
  lyrics: { lineHeight: 28, fontWeight: '500' },
  emptyCard: { padding: 32, borderRadius: 12, alignItems: 'center', marginTop: 40, marginHorizontal: 20 },
  emptyText: { fontSize: 15, fontWeight: '500', textAlign: 'center' },
  // Estilo para a quebra de estrofe
  stanzaBreak: {
    height: 16, // Cria um espaço vertical entre as estrofes
  },
});
