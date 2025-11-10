import { router } from 'expo-router';
import { Music as MusicIcon, X, Clock } from 'lucide-react-native';
import React, { useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';

import FloatingNavMenu from '@/components/FloatingNavMenu';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import type { Music } from '@/types/music';

const QuickAccessSongCard = memo(({
  song,
  colors,
  onPress,
  onRemove,
}: {
  song: Music;
  colors: typeof Colors.light;
  onPress: () => void;
  onRemove: () => void;
}) => (
  <View style={[styles.songCard, { backgroundColor: colors.card }]}>
    <TouchableOpacity style={styles.songContent} onPress={onPress}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
        <MusicIcon size={18} color={colors.secondary} />
      </View>
      <View style={styles.songInfo}>
        <Text style={[styles.songTitle, { color: colors.text }]}>{song.title}</Text>
        {song.artist && (
          <Text style={[styles.songArtist, { color: colors.textSecondary }]}>
            {song.artist}
          </Text>
        )}
      </View>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.removeButton, { backgroundColor: colors.error }]}
      onPress={onRemove}
    >
      <X size={18} color="#ffffff" />
    </TouchableOpacity>
  </View>
));

QuickAccessSongCard.displayName = 'QuickAccessSongCard';

export default function QuickAccessScreen() {
  const { isDarkMode, quickAccessSongs, removeFromQuickAccess } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const handleRemove = useCallback((songId: string, songTitle: string) => {
    Alert.alert(
      'Remover do Acesso Rápido',
      `Deseja remover "${songTitle}" do acesso rápido?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeFromQuickAccess(songId),
        },
      ]
    );
  }, [removeFromQuickAccess]);

  const navigateToSong = useCallback((songId: string) => {
    router.push(`/song/${songId}`);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {quickAccessSongs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.card }]}>
            <Clock size={48} color={colors.textLight} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhuma música adicionada</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Adicione até 10 músicas para acesso rápido durante cultos e ensaios
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {quickAccessSongs.length}/10 músicas • Expira em 24h
          </Text>
          {quickAccessSongs.map((song) => (
            <QuickAccessSongCard
              key={song.id}
              song={song}
              colors={colors}
              onPress={() => navigateToSong(song.id)}
              onRemove={() => handleRemove(song.id, song.title)}
            />
          ))}
        </ScrollView>
      )}
      
      <FloatingNavMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  songContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
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
