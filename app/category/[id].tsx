import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import SongListItem from '@/components/SongListItem';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Music } from '@/types/music';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // usa o hook que você forneceu no AppContext
  const { isDarkMode, songs, categories, addToQuickAccess, removeFromQuickAccess, quickAccessSongs } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const categoryId = Number(id);

  const currentCategory = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId]
  );

  // usa category_ids (array) conforme seu tipo Music
  const songsInCategory = useMemo(
    () => songs.filter((song) => Array.isArray(song.category_ids) && song.category_ids.includes(categoryId)),
    [songs, categoryId]
  );

  const handleAddToQuickAccess = useCallback(
    (song: Music) => {
      // seu AppContext tem addToQuickAccess(songId: number)
      // se o addToQuickAccess for async, não precisa await aqui — tratar erros no contexto
      addToQuickAccess(song.id);
    },
    [addToQuickAccess]
  );

  const handleRemoveFromQuickAccess = useCallback(
    (song: Music) => {
      removeFromQuickAccess(song.id);
    },
    [removeFromQuickAccess]
  );

  const handleEdit = useCallback(
    (song: Music) => {
      router.push(`/song-form?songId=${song.id}`);
    },
    [router]
  );

  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <ChevronLeft size={28} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {currentCategory ? currentCategory.name : 'Categoria'}
          </Text>
        </View>

        {songsInCategory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhuma música nesta categoria.
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            {songsInCategory.map((song) => {
              const isInQuickAccess = quickAccessSongs.some((s) => s.id === song.id);

              return (
                <SongListItem
                  key={song.id}
                  song={song}
                  colors={colors}
                  onPress={() => router.push(`/song/${song.id}`)}
                  onAddToQueue={() => handleAddToQuickAccess(song)}       // mapeado para quick access
                  onRemoveFromQueue={() => handleRemoveFromQuickAccess(song)}
                  onEdit={() => handleEdit(song)}
                  isInCategoryView={true}
                  isSongInQueue={isInQuickAccess} // alimenta o estado do botão/popover
                />
              );
            })}
          </ScrollView>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
});
