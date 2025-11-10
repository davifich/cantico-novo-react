import { router } from 'expo-router';
import { Music } from 'lucide-react-native';
import React, { useMemo, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';

import FloatingNavMenu from '@/components/FloatingNavMenu';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import type { Music as MusicType } from '@/types/music';

const SongListItem = memo(({
  song,
  colors,
  onPress,
}: {
  song: MusicType;
  colors: typeof Colors.light;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.songCard, { backgroundColor: colors.card }]}
    onPress={onPress}
  >
    <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
      <Music size={18} color={colors.secondary} />
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
));

SongListItem.displayName = 'SongListItem';

export default function AllSongsScreen() {
  const { isDarkMode, songs } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const navigateToSong = useCallback((songId: string) => {
    router.push(`/song/${songId}`);
  }, []);

  const sortedSongs = useMemo(() => {
    return [...songs].sort((a, b) => a.title.localeCompare(b.title));
  }, [songs]);

  const groupedSongs = useMemo(() => {
    const groups: Record<string, typeof songs> = {};
    sortedSongs.forEach((song) => {
      const firstLetter = song.title[0].toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(song);
    });
    return groups;
  }, [sortedSongs]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedSongs)
          .sort()
          .map((letter) => (
            <View key={letter} style={styles.section}>
              <View style={[styles.letterHeader, { backgroundColor: colors.primary }]}>
                <Text style={[styles.letterText, { color: colors.secondary }]}>{letter}</Text>
              </View>
              {groupedSongs[letter].map((song) => (
                <SongListItem
                  key={song.id}
                  song={song}
                  colors={colors}
                  onPress={() => navigateToSong(song.id)}
                />
              ))}
            </View>
          ))}
      </ScrollView>
      
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
    paddingBottom: 110,
  },
  section: {
    marginBottom: 24,
  },
  letterHeader: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  letterText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
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
});
