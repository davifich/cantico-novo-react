
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Text } from 'react-native';

import SongListItem from '../components/SongListItem';
import { ThemedView } from '../components/themed-view';
import Colors from '../constants/colors';
import { useApp } from '../contexts/AppContext';
import { Music } from '../types/music';

export default function QuickAccessScreen() {
  const { quickAccessSongs, removeFromQuickAccess, isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const router = useRouter();

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
    ({ item }: { item: Music }) => (
      <SongListItem
        song={item}
        colors={colors}
        onPress={() => router.push(`/song/${item.id}`)}
        // Correctly pass the functions and the state
        onAddToQueue={() => {}} // Not used here, but prop is required
        onRemoveFromQueue={() => handleRemoveFromQueue(item.id)}
        onEdit={() => handleEdit(item)}
        isSongInQueue={true} // All songs in this list are in the queue
      />
    ),
    [colors, router, handleRemoveFromQueue, handleEdit]
  );

  return (
    <ThemedView style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Acesso Rápido</Text>
      <FlashList
        data={quickAccessSongs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
        ListEmptyComponent={<Text style={{color: colors.text, textAlign: 'center', marginTop: 20}}>A sua fila de acesso rápido está vazia.</Text>}
      />
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
