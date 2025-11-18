
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

import SongListItem from '../components/SongListItem';
import { ThemedView } from '../components/themed-view';
import Colors from '../constants/colors';
import { useApp } from '../contexts/AppContext';
import { Music } from '../types/music';

export default function AllSongsScreen() {
  const { songs, quickAccessSongs, addToQuickAccess, removeFromQuickAccess, isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const router = useRouter();

  // Create a Set of song IDs in the queue for quick lookup
  const songsInQueue = useMemo(() => new Set(quickAccessSongs.map(s => s.id)), [quickAccessSongs]);

  const handleAddToQueue = useCallback(
    (songId: number) => {
      addToQuickAccess(songId);
    },
    [addToQuickAccess]
  );

  const handleRemoveFromQueue = useCallback(
    (songId: number) => {
      removeFromQuickAccess(songId);
    },
    [removeFromQuickAccess]
  );

  const handleEdit = useCallback(
    (song: Music) => {
      router.push(`/song-form?songId=${song.id}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: Music }) => {
      const isSongInQueue = songsInQueue.has(item.id);
      return (
        <SongListItem
          song={item}
          colors={colors}
          onPress={() => router.push(`/song/${item.id}`)}
          onAddToQueue={() => handleAddToQueue(item.id)}
          onRemoveFromQueue={() => handleRemoveFromQueue(item.id)}
          onEdit={() => handleEdit(item)}
          isSongInQueue={isSongInQueue} // Pass the correct state
        />
      );
    },
    [colors, router, handleAddToQueue, handleRemoveFromQueue, handleEdit, songsInQueue]
  );

  const memoizedList = useMemo(
    () => (
      <FlashList
        data={songs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
      />
    ),
    [songs, renderItem]
  );

  return (
    <ThemedView style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Todas as Músicas</Text>
      {memoizedList}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
  },
});
