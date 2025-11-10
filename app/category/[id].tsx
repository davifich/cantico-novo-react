import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Music as MusicIcon } from 'lucide-react-native';
import React, { useMemo, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';

import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import type { Music } from '@/types/music';

const CategorySongItem = memo(({
  song,
  colors,
  onPress,
}: {
  song: Music;
  colors: typeof Colors.light;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.songCard, { backgroundColor: colors.card }]}
    onPress={onPress}
  >
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
));

CategorySongItem.displayName = 'CategorySongItem';

export default function CategoryDetailScreen() {
  const { id: idString } = useLocalSearchParams<{ id: string }>();
  const { isDarkMode, categories, songs, isOnline } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const id = useMemo(() => (idString ? parseInt(idString, 10) : NaN), [idString]);

  const navigateToSong = useCallback((songId: number) => {
    router.push(`/song/${songId}`);
  }, []);

  const category = useMemo(() => {
    return categories.find((cat) => cat.id === id);
  }, [categories, id]);

  const isEditDisabled = useMemo(() => {
    if (!category) return true;
    const disabled = category.status === 'synced' && !isOnline;
    if (disabled) {
      console.log(`Edição da categoria "${category.name}" (ID: ${category.id}) desabilitada: status 'synced' e modo offline.`);
    }
    return disabled;
  }, [category, isOnline]);

  const categorySongs = useMemo(() => {
    if (!category) return [];
    return songs.filter((song) => song.categories.includes(category.name.toLowerCase()));
  }, [songs, category]);

  if (!category) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Categoria não encontrada' }} />
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Categoria não encontrada
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: category.name }} />
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: category.color }]}>
        <Text style={styles.headerTitle}>{category.name}</Text>
        <Text style={styles.headerSubtitle}>
          {categorySongs.length} {categorySongs.length === 1 ? 'música' : 'músicas'}
        </Text>
      </View>
      
      {isEditDisabled && (
        <View style={[styles.warningBanner, { backgroundColor: colors.warningContainer }]}>
            <Text style={[styles.warningText, { color: colors.warningText }]}>
                Modo offline: Edição desativada para categorias já salvas.
            </Text>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {categorySongs.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhuma música nesta categoria
            </Text>
          </View>
        ) : (
          categorySongs.map((song) => (
            <CategorySongItem
              key={song.id}
              song={song}
              colors={colors}
              onPress={() => navigateToSong(song.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16, // Reduzido para dar espaço ao banner
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  warningBanner: {
    padding: 12,
    alignItems: 'center',
  },
  warningText: {
      fontSize: 14,
      fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});
