import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ListMusic, Minus, Pause, Play, Plus } from 'lucide-react-native'; // Adicionado ListMusic
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, AppState,
  LayoutChangeEvent, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AVPlaybackStatus } from 'expo-av';

import audioService from '@/src/audio/audioService.js';
import PlayerControls from '@/components/PlayerControls';
import Heartbeat from '@/components/Heartbeat';
import SongSelectionModal from '@/components/SongSelectionModal'; // **NOVA IMPORTAÇÃO**
import { Music } from '@/types/music';

// Tipos para os dados do karaokê
type LyricWord = { text: string; startTime: number; endTime: number };
type LyricLine = { time: number; text: string; words: LyricWord[] };

export default function KaraokePlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parâmetros
  const mode = params.mode as 'reader' | 'karaoke';
  const title = params.title as string;

  // Estados
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isKaraokeListVisible, setKaraokeListVisible] = useState(false); // **NOVO ESTADO**

  // Modo Leitor
  const [isReaderPlaying, setReaderPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(0.5);
  const readerScrollRef = useRef<ScrollView>(null);
  const readerScrollPosition = useRef(0);
  const readerAnimationFrame = useRef<number | null>(null);

  // Modo Karaokê
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [bpm, setBpm] = useState(0);
  const [audioStatus, setAudioStatus] = useState<AVPlaybackStatus>();
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const karaokeScrollRef = useRef<ScrollView>(null);
  const lineLayouts = useRef<Array<{ y: number; height: number }>>([]);

  // **NOVA FUNÇÃO** para trocar de música
  const handleSelectSong = (song: Music) => {
    setKaraokeListVisible(false);
    audioService.unload(); // Garante que o áudio anterior pare
    
    // Usa router.replace para recarregar a tela com novos parâmetros
    router.replace({
      pathname: '/player',
      params: {
        mode: 'karaoke',
        title: song.title,
        audioUri: song.audio_uri,
        lyricsData: JSON.stringify(song.lyrics_karaoke),
        bpm: song.bpm,
      },
    });
  };

  // Lógica de Sincronização
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setAudioStatus(status);
    if (!status.isLoaded || !lyrics.length) return;

    const currentTime = status.positionMillis / 1000;
    let newActiveLineIndex = -1;

    for (let i = lyrics.length - 1; i >= 0; i--) {
      const lineStartTime = lyrics[i].words[0]?.startTime ?? lyrics[i].time;
      if (currentTime >= lineStartTime) {
        newActiveLineIndex = i;
        break;
      }
    }

    setActiveLineIndex(newActiveLineIndex);
  };

  // Efeitos
  useEffect(() => {
    const loadContent = async () => {
      try {
        if (mode === 'karaoke') {
          const audioUri = params.audioUri as string;
          if (!audioUri) throw new Error("URI do áudio não fornecida.");

          const lyricsData = JSON.parse(params.lyricsData as string) as LyricLine[];
          const bpmData = parseInt(params.bpm as string, 10);

          setLyrics(lyricsData);
          setBpm(bpmData);
          await audioService.load(audioUri, onPlaybackStatusUpdate);
        }
      } catch (e: any) {
        setError(`Falha ao carregar: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();

    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/) && audioStatus?.isLoaded && audioStatus.isPlaying) {
        audioService.pause();
      }
    });

    return () => {
      if (mode === 'karaoke') {
        audioService.unload();
      }
      appStateSubscription.remove();
    };
  }, [params]); // **MODIFICADO** - Re-executa o efeito quando os parâmetros mudam

  useEffect(() => {
    if (activeLineIndex < 0 || !karaokeScrollRef.current) return;
    const layout = lineLayouts.current[activeLineIndex];
    if (layout) {
      karaokeScrollRef.current.scrollTo({ y: layout.y - 100, animated: true });
    }
  }, [activeLineIndex]);

  useEffect(() => {
    const scrollReader = () => {
      readerScrollPosition.current += scrollSpeed;
      readerScrollRef.current?.scrollTo({ y: readerScrollPosition.current, animated: false });
      readerAnimationFrame.current = requestAnimationFrame(scrollReader);
    };
    if (mode === 'reader' && isReaderPlaying) {
      readerAnimationFrame.current = requestAnimationFrame(scrollReader);
    }
    return () => {
      if (readerAnimationFrame.current) cancelAnimationFrame(readerAnimationFrame.current);
    };
  }, [isReaderPlaying, scrollSpeed, mode]);

  // Renderização
  if (isLoading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color="#fff"/></SafeAreaView>;
  }
  if (error) {
    return <SafeAreaView style={styles.container}><Text style={styles.errorText}>{error}</Text></SafeAreaView>;
  }

  const renderReaderMode = () => (
    <>
      <ScrollView ref={readerScrollRef} contentContainerStyle={styles.lyricsContainer}>
        <Text style={styles.readerLyricsText}>{params.lyrics as string}</Text>
      </ScrollView>
      <View style={styles.readerControlsContainer}>
        <TouchableOpacity onPress={() => setScrollSpeed(s => Math.max(0.1, s - 0.1))} style={styles.readerControlButton}><Minus size={28} color="white" /></TouchableOpacity>
        <TouchableOpacity onPress={() => setReaderPlaying(!isReaderPlaying)} style={[styles.readerControlButton, styles.readerPlayButton]}>
          {isReaderPlaying ? <Pause size={32} color="black" /> : <Play size={32} color="black" />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setScrollSpeed(s => s + 0.1)} style={styles.readerControlButton}><Plus size={28} color="white" /></TouchableOpacity>
      </View>
    </>
  );

  const renderKaraokeMode = () => (
    <>
      <View style={styles.heartbeatContainer}>
          <Heartbeat isPlaying={audioStatus?.isLoaded && audioStatus.isPlaying || false} bpm={bpm} />
      </View>
      <ScrollView ref={karaokeScrollRef} contentContainerStyle={styles.lyricsContainer}>
        {lyrics.map((line, index) => (
          <View 
            key={index} 
            onLayout={(event: LayoutChangeEvent) => { lineLayouts.current[index] = event.nativeEvent.layout; }}
          >
            <Text style={[styles.karaokeLyricsText, activeLineIndex === index && styles.activeLine]}>
              {line.text}
            </Text>
          </View>
        ))}
      </ScrollView>
      <PlayerControls 
        status={audioStatus} 
        onPlayPause={audioService.togglePlayback} 
        onSkip={audioService.skip} 
      />
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><ArrowLeft size={24} color="white" /></TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{title || 'Player'}</Text>
        {/* **MODIFICAÇÃO DO PLANO DE AÇÃO** - Botão para abrir a lista */}
        {mode === 'karaoke' ? (
          <TouchableOpacity onPress={() => setKaraokeListVisible(true)} style={styles.listButton}>
            <ListMusic size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} /> // Mantém o espaçamento em modo leitor
        )}
      </View>
      {mode === 'reader' ? renderReaderMode() : renderKaraokeMode()}

      {/* **MODIFICAÇÃO DO PLANO DE AÇÃO** - Modal de seleção */}
      <SongSelectionModal
        isVisible={isKaraokeListVisible}
        onClose={() => setKaraokeListVisible(false)}
        onSelectSong={handleSelectSong}
        filter='karaoke'
      />
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
  backButton: { padding: 5 },
  listButton: { padding: 5 }, // **NOVO ESTILO**
  title: { fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center', flex: 1, marginHorizontal: 10 },
  errorText: { color: 'red', fontSize: 18, textAlign: 'center', padding: 20 },
  lyricsContainer: { paddingVertical: 20, paddingHorizontal: 10 },
  readerLyricsText: { color: '#DDD', fontSize: 22, lineHeight: 40, textAlign: 'center' },
  readerControlsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#333' },
  readerControlButton: { padding: 15 },
  readerPlayButton: { backgroundColor: 'white', borderRadius: 50, padding: 20, marginHorizontal: 30 },
  heartbeatContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
  karaokeLyricsText: { color: '#888', fontSize: 26, fontWeight: 'bold', textAlign: 'center', paddingVertical: 15 },
  activeLine: { color: '#00AEEF' },
});
