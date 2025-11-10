import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, SkipForward, SkipBack, X, Music2 } from 'lucide-react-native';
import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FloatingNavMenu from '@/components/FloatingNavMenu';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

interface TrackItemProps {
  title: string;
  artist?: string;
  isPlaying: boolean;
  colors: typeof Colors.light;
  onPress: () => void;
}

const TrackItem = memo(({ title, artist, isPlaying, colors, onPress }: TrackItemProps) => (
  <TouchableOpacity
    style={[
      styles.trackCard,
      { backgroundColor: colors.card },
      isPlaying && { borderColor: colors.primary, borderWidth: 2 },
    ]}
    onPress={onPress}
  >
    <View style={[styles.trackIcon, { backgroundColor: colors.primary }]}>
      <Music2 size={20} color={colors.secondary} />
    </View>
    <View style={styles.trackInfo}>
      <Text style={[styles.trackTitle, { color: colors.text }]}>{title}</Text>
      {artist && (
        <Text style={[styles.trackArtist, { color: colors.textSecondary }]}>{artist}</Text>
      )}
    </View>
    {isPlaying && (
      <View style={[styles.playingIndicator, { backgroundColor: colors.primary }]}>
        <Text style={[styles.playingText, { color: colors.secondary }]}>▶</Text>
      </View>
    )}
  </TouchableOpacity>
));

TrackItem.displayName = 'TrackItem';

export default function PlayerScreen() {
  const { isDarkMode, songs } = useApp();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);

  const colors = isDarkMode ? Colors.dark : Colors.light;

  const currentTrack = songs[currentTrackIndex];

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (currentTrackIndex < songs.length - 1) {
      setCurrentTrackIndex((prev) => prev + 1);
    }
  }, [currentTrackIndex, songs.length]);

  const handlePrevious = useCallback(() => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex((prev) => prev - 1);
    }
  }, [currentTrackIndex]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    Alert.alert('Player', 'Reprodução parada');
  }, []);

  const handleTrackSelect = useCallback((index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Estúdio de Ensaio</Text>
            <Text style={[styles.subtitle, { color: colors.secondary }]}>
              Reprodutor de Música
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {songs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.card }]}>
                <Music2 size={48} color={colors.textLight} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Nenhuma música disponível
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Adicione músicas para usar o player
              </Text>
            </View>
          ) : (
            <>
              <View style={[styles.playerCard, { backgroundColor: colors.card }]}>
                <View style={[styles.albumArt, { backgroundColor: colors.primary }]}>
                  <Music2 size={64} color={colors.secondary} strokeWidth={2} />
                </View>
                <Text style={[styles.nowPlayingTitle, { color: colors.text }]}>
                  {currentTrack?.title || 'Nenhuma música selecionada'}
                </Text>
                {currentTrack?.artist && (
                  <Text style={[styles.nowPlayingArtist, { color: colors.textSecondary }]}>
                    {currentTrack.artist}
                  </Text>
                )}

                <View style={styles.controls}>
                  <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: colors.surface }]}
                    onPress={handlePrevious}
                    disabled={currentTrackIndex === 0}
                  >
                    <SkipBack
                      size={28}
                      color={currentTrackIndex === 0 ? colors.textLight : colors.text}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.playButton, { backgroundColor: colors.primary }]}
                    onPress={handlePlayPause}
                  >
                    {isPlaying ? (
                      <Pause size={36} color={colors.secondary} fill={colors.secondary} />
                    ) : (
                      <Play size={36} color={colors.secondary} fill={colors.secondary} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: colors.surface }]}
                    onPress={handleNext}
                    disabled={currentTrackIndex === songs.length - 1}
                  >
                    <SkipForward
                      size={28}
                      color={
                        currentTrackIndex === songs.length - 1 ? colors.textLight : colors.text
                      }
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.stopButton, { backgroundColor: colors.error }]}
                  onPress={handleStop}
                >
                  <X size={20} color="#ffffff" />
                  <Text style={styles.stopButtonText}>Parar</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.trackList}
                contentContainerStyle={styles.trackListContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.trackListTitle, { color: colors.text }]}>Fila de Músicas</Text>
                {songs.map((song, index) => (
                  <TrackItem
                    key={song.id}
                    title={song.title}
                    artist={song.artist}
                    isPlaying={isPlaying && index === currentTrackIndex}
                    colors={colors}
                    onPress={() => handleTrackSelect(index)}
                  />
                ))}
              </ScrollView>
            </>
          )}
        </View>

        <FloatingNavMenu />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingBottom: 24,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  playerCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  albumArt: {
    width: 180,
    height: 180,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  nowPlayingTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  nowPlayingArtist: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 32,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  trackList: {
    flex: 1,
  },
  trackListContent: {
    paddingBottom: 20,
  },
  trackListTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  trackIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 13,
    fontWeight: '500',
  },
  playingIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
});
