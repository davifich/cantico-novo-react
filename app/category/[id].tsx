
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

import SongListItem from '@/components/SongListItem';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDarkMode, songs, categories } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const categoryId = Number(id);

  // Encontra a categoria atual com base no ID da rota
  const currentCategory = useMemo(() => 
    categories.find(c => c.id === categoryId)
  , [categories, categoryId]);

  // Filtra as músicas que pertencem à categoria atual
  const songsInCategory = useMemo(() => 
    songs.filter(song => song.category_ids.includes(categoryId))
  , [songs, categoryId]);

  const navigateToSong = useCallback((songId: number) => {
    router.push(`/song/${songId}`);
  }, []);

  const goBack = useCallback(() => {
    router.back();
  }, []);

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
            {songsInCategory.map((song) => (
              <SongListItem
                key={song.id}
                song={song}
                colors={colors}
                onPress={() => navigateToSong(song.id)}
                isInCategoryView={true}
              />
            ))}
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
