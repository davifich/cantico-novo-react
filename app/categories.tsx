
import { router } from 'expo-router';
import { FolderOpen, DiamondPlus as Plus, Trash2 } from 'lucide-react-native';
import React, { useMemo, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Category } from '@/types/music';

const CategoryCard = memo((
  { category, songCount, colors, onPress, onDelete }: 
  { category: Category; songCount: number; colors: typeof Colors.light; onPress: () => void; onDelete: () => void; }
) => {
  // A regra: categorias com ID maior que 10 são consideradas criadas pelo usuário e podem ser apagadas.
  const isDeletable = category.id > 10;

  return (
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
      {isDeletable && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Trash2 size={22} color={colors.textLight} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
});
CategoryCard.displayName = 'CategoryCard';

export default function CategoriesScreen() {
  const { isDarkMode, categories, songs, deleteCategory } = useApp();
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

  const navigateToCreateCategory = useCallback(() => {
    router.push('/create-category');
  }, []);

  const handleDeleteCategory = useCallback((categoryId: number, categoryName: string) => {
    Alert.alert(
      `Apagar "${categoryName}"?`,
      "As músicas desta categoria não serão apagadas, mas ficarão sem categoria. Esta ação não pode ser desfeita.",
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Apagar', 
          style: 'destructive', 
          onPress: () => deleteCategory(categoryId) 
        },
      ]
    );
  }, [deleteCategory]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Categorias</Text>
          <TouchableOpacity style={styles.addButton} onPress={navigateToCreateCategory}>
            <Plus size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {categories.length === 0 ? (
           <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhuma categoria encontrada.
            </Text>
            <TouchableOpacity onPress={navigateToCreateCategory}>
              <Text style={[styles.createText, { color: colors.primary }]}>
                Criar a primeira categoria
              </Text>
            </TouchableOpacity>
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
                onDelete={() => handleDeleteCategory(category.id, category.name)}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  addButton: {
    padding: 8,
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
  createText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
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
  deleteButton: {
    padding: 8, 
    marginLeft: 12, 
  },
});
