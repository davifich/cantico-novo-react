
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState, useCallback, useEffect, lazy, Suspense, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, ActivityIndicator, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';

import Colors from '../../constants/colors';
import { useApp } from '../../contexts/AppContext';
import { Music } from '../../types/music';

// Lazy load components
const CifraViewer = lazy(() => import('../../components/CifraViewer'));
const SideBarMenu = lazy(() => import('../../components/SideBarMenu'));

const ZOOM_LEVELS = [1, 1.15, 1.3, 1.45, 1.6] as const;

type ViewMode = 'letra' | 'cifra' | 'partitura';

// --- Helper Function ---
const renderFormattedLyrics = (text: string, style: any) => {
  const lines = text.split('\n');
  return lines.map((line, lineIndex) => {
    if (line.trim() === '/') return <View key={lineIndex} style={styles.stanzaBreak} />;
    const parts = line.split(/(\*.*?\*)/g);
    return (
      <Text key={lineIndex} style={style}>
        {parts.map((part, partIndex) => part.startsWith('*') && part.endsWith('*') ? 
          <Text key={partIndex} style={{ fontWeight: 'bold' }}>{part.slice(1, -1)}</Text> : part)}
      </Text>
    );
  });
};

// --- Fullscreen Screen Component ---
export default function SongFullscreen() {
  const { id: idString, viewMode: initialViewMode } = useLocalSearchParams<{ id: string, viewMode: ViewMode }>();
  const id = useMemo(() => (idString ? parseInt(idString, 10) : NaN), [idString]);
  const router = useRouter();

  const { isDarkMode, songs } = useApp();
  const colors = useMemo(() => (isDarkMode ? Colors.dark : Colors.light), [isDarkMode]);

  const [song, setSong] = useState<Music | undefined>(undefined);
  // O viewMode é definido uma vez e não muda mais
  const [viewMode] = useState<ViewMode>(initialViewMode || 'letra');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [autoScroll, setAutoScroll] = useState({ isScrolling: false, speed: 5 });
  
  const scrollRef = useRef<ScrollView>(null);
  const scrollPosition = useRef(0);
  const animationFrame = useRef<number | null>(null);

  // --- Effects ---
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    const currentSong = songs.find((s) => s.id === id);
    setSong(currentSong);

    return () => { ScreenOrientation.unlockAsync(); };
  }, [songs, id]);

  useEffect(() => {
    const scroll = () => {
      scrollPosition.current += autoScroll.speed / 10;
      scrollRef.current?.scrollTo({ y: scrollPosition.current, animated: false });
      animationFrame.current = requestAnimationFrame(scroll);
    };

    if (autoScroll.isScrolling) {
      animationFrame.current = requestAnimationFrame(scroll);
    } else if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }

    return () => { if (animationFrame.current) cancelAnimationFrame(animationFrame.current); };
  }, [autoScroll]);

  // --- Handlers ---
  const handleZoomIn = useCallback(() => setZoomLevel(z => Math.min(z + 1, ZOOM_LEVELS.length - 1)), []);
  const handleZoomOut = useCallback(() => setZoomLevel(z => Math.max(z - 1, 0)), []);
  const handleExitFullscreen = useCallback(() => { router.back(); }, [router]);

  const handleToggleAutoScroll = useCallback(() => {
    setAutoScroll(prev => ({ ...prev, isScrolling: !prev.isScrolling }));
  }, []);

  const handleChangeScrollSpeed = useCallback((newSpeed: number) => {
    setAutoScroll({ speed: newSpeed, isScrolling: true });
  }, []);

  // --- Render Logic ---
  const renderContent = () => {
    const contentProps = { ref: scrollRef, contentContainerStyle: styles.scrollContent };
    if (!song) return null;

    switch (viewMode) {
      case 'partitura':
        if (song.has_partitura && song.file_path) {
          return <WebView source={{ uri: song.file_path }} style={styles.pdf} />;
        }
        break; 
      case 'cifra':
        if (song.has_cifra && song.cifra) {
          return (
            <Suspense fallback={<ActivityIndicator color={colors.primary} style={{ marginTop: 20}} />}>
              <ScrollView {...contentProps}><CifraViewer content={song.cifra} zoomFactor={ZOOM_LEVELS[zoomLevel]} /></ScrollView>
            </Suspense>
          );
        }
        break;
      case 'letra':
        if (song.letra) {
          return (
            <ScrollView {...contentProps}>
              {renderFormattedLyrics(song.letra, [styles.lyrics, { color: colors.text, fontSize: 16 * ZOOM_LEVELS[zoomLevel] }])}
            </ScrollView>
          );
        }
        break;
    }

    // Fallback: Se o modo selecionado não estiver disponível, mostra a letra.
    if (song.letra) {
      return (
        <ScrollView {...contentProps}>
          {renderFormattedLyrics(song.letra, [styles.lyrics, { color: colors.text, fontSize: 16 * ZOOM_LEVELS[zoomLevel] }])}
        </ScrollView>
      );
    }
    
    return (
      <View style={[styles.emptyCard, { backgroundColor: colors.card }]}><Text style={[styles.emptyText, { color: colors.textSecondary }]}>Conteúdo indisponível.</Text></View>
    );
  };

  if (!song) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const sideBarMenuProps = {
    viewMode,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    zoomLevel,
    maxZoomLevel: ZOOM_LEVELS.length - 1,
    onToggleFullscreen: handleExitFullscreen,
    autoScroll,
    onToggleAutoScroll: handleToggleAutoScroll,
    onChangeScrollSpeed: handleChangeScrollSpeed,
  };

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} hidden />

      <View style={styles.contentContainer}>{renderContent()}</View>

      <Suspense fallback={null}>
        <SideBarMenu {...sideBarMenuProps} />
      </Suspense>
    </GestureHandlerRootView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 150 },
  pdf: { flex: 1, width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  lyrics: { lineHeight: 28, fontWeight: '500' },
  emptyCard: { padding: 32, borderRadius: 12, alignItems: 'center', marginTop: 40, marginHorizontal: 20 },
  emptyText: { fontSize: 15, fontWeight: '500', textAlign: 'center' },
  stanzaBreak: { height: 16 },
});
