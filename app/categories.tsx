
import { router } from 'expo-router';
import { FolderOpen } from 'lucide-react-native';
import React, { useMemo, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Category } from '@/types/music';

const CategoryCard = memo((
  { category, songCount, colors, onPress }: 
  { category: Category; songCount: number; colors: typeof Colors.light; onPress: () => void; }
) => (
  <TouchableOpacity
    style={[styles.categoryCard, { backgroundColor: colors.card }]}
    onPress={onPress}
  >
    <View style={[styles.iconContainer, { backgroundColor: category.color || colors.primary }]}>
      <FolderOpen size={28} color="#ffffff" />
    </View>
    <View style={styles.categoryInfo}>
      <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
      <Text style={[styles.songCount, { color: colors.textSecondary }]}>
        {songCount} {songCount === 1 ? 'música' : 'músicas'}
      </Text>
    </View>
  </TouchableOpacity>
));
CategoryCard.displayName = 'CategoryCard';

export default function CategoriesScreen() {
  const { isDarkMode, categories, songs } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const categoryCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const song of songs) {
      for (const categoryId of song.category_ids) {
        counts[categoryId] = (counts[categoryId] || 0) + 1;
      }
    }
    return counts;
  }, [songs]);

  const navigateToCategory = useCallback((categoryId: number) => {
    router.push(`/category/${categoryId}`);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Categorias</Text>
        </View>

        {categories.length === 0 ? (
           <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhuma categoria encontrada.
            </Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
              Crie categorias para organizar suas músicas.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                songCount={categoryCounts[category.id] || 0}
                colors={colors}
                onPress={() => navigateToCategory(category.id)}
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  songCount: {
    fontSize: 14,
    fontWeight: '500',
  },
});
