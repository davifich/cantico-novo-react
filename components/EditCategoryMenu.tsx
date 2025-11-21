
import { router } from 'expo-router';
import { Check, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import Colors from '../constants/colors';
import { useApp } from '../contexts/AppContext';
import { Music, Category } from '../types/music';

interface EditCategoryMenuProps {
  song: Music;
  onClose: () => void;
}

const EditCategoryMenu: React.FC<EditCategoryMenuProps> = ({ song, onClose }) => {
  const { isDarkMode, categories, updateSong } = useApp(); // CORREÇÃO: Usa `updateSong`
  const colors = isDarkMode ? Colors.dark : Colors.light;
  
  // Estado local para gerenciar a UI de forma otimista
  const [optimisticCategoryIds, setOptimisticCategoryIds] = useState(new Set(song.category_ids));
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCategoryPress = async (categoryId: number) => {
    // Clona o Set para evitar mutação direta do estado
    const newCategoryIds = new Set(optimisticCategoryIds);

    if (newCategoryIds.has(categoryId)) {
      newCategoryIds.delete(categoryId);
    } else {
      newCategoryIds.add(categoryId);
    }

    // Atualização otimista da UI
    setOptimisticCategoryIds(newCategoryIds);
    setIsUpdating(true);

    try {
      // Chama a função correta do contexto
      await updateSong(song.id, { category_ids: Array.from(newCategoryIds) });
    } catch (error) {
      console.error("Falha ao atualizar categoria da música:", error);
      // Reverte a UI em caso de erro
      setOptimisticCategoryIds(new Set(song.category_ids)); 
    } finally {
      setIsUpdating(false);
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = optimisticCategoryIds.has(item.id);
    return (
      <TouchableOpacity 
        style={styles.categoryItem}
        onPress={() => handleCategoryPress(item.id)}
        disabled={isUpdating} // Desabilita cliques durante a atualização
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
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Adicionar à Categoria</Text>
        {isUpdating && <ActivityIndicator size="small" color={colors.primary} style={styles.activityIndicator} />}
      </View>
      
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
        style={[styles.actionButton, { borderTopColor: colors.border }]}
        onPress={() => {
          onClose();
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
    paddingTop: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12, 
    paddingBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activityIndicator: {
    marginLeft: 10,
  },
  list: {
    maxHeight: 250,
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
    marginTop: 8, // Adiciona um espaço antes do botão
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default EditCategoryMenu;
