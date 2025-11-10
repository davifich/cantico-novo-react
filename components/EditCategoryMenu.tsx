
import { router } from 'expo-router';
import { Check, Plus } from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Music } from '@/types/music';

interface EditCategoryMenuProps {
  song: Music;
  onClose: () => void;
}

const EditCategoryMenu: React.FC<EditCategoryMenuProps> = ({ song, onClose }) => {
  const { 
    isDarkMode, 
    categories, 
    addSongToCategory, 
    removeSongFromCategory, 
    isOnline, 
  } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const songCategoryIds = React.useMemo(() => new Set(song.category_ids), [song.category_ids]);

  const handleCategoryPress = async (categoryId: number) => {
    const isSongInCategory = songCategoryIds.has(categoryId);
    
    try {
      if (isSongInCategory) {
        await removeSongFromCategory(song.id, categoryId);
      } else {
        await addSongToCategory(song.id, categoryId);
      }
    } catch (error) {
      console.error("Falha ao atualizar categoria da música:", error);
    }
  };

  const renderCategoryItem = ({ item }: { item: typeof categories[0] }) => {
    const isSelected = songCategoryIds.has(item.id);
    return (
      <TouchableOpacity 
        style={styles.categoryItem}
        onPress={() => handleCategoryPress(item.id)}
      >
        <View style={[styles.categoryColorIndicator, { backgroundColor: item.color }]} />
        <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        {isSelected && <Check size={20} color={colors.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Adicionar à Categoria</Text>
      
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            <Text style={{ color: colors.textSecondary }}>Nenhuma categoria criada.</Text>
          </View>
        )}
      />

      <TouchableOpacity 
        style={[styles.actionButton, { borderTopColor: colors.border, borderBottomColor: colors.border }]}
        onPress={() => {
          onClose(); // Fecha o menu atual
          // CORREÇÃO: Usando a sintaxe de objeto para satisfazer a tipagem do Expo Router
          router.push({ pathname: '/create-category' });
        }}
      >
        <Plus size={20} color={colors.primary} />
        <Text style={[styles.actionButtonText, { color: colors.primary }]}>
          Criar nova categoria
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  list: {
    maxHeight: 250, // Limita a altura da lista para telas com muitas categorias
  },
  emptyListContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  categoryColorIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 16,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default EditCategoryMenu;
