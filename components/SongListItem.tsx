
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import Colors from '@/constants/colors';
import { Music } from '@/types/music';

interface SongListItemProps {
  song: Music;
  colors: typeof Colors.light;
  onPress: () => void;
  // A propriedade agora é opcional, permitindo que o componente seja usado em diferentes contextos
  isInCategoryView?: boolean;
}

const SongListItem: React.FC<SongListItemProps> = ({ song, colors, onPress, isInCategoryView }) => {
  return (
    // Adiciona um estilo de margem condicional se estiver na visualização de categoria
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.songCard, 
        { backgroundColor: colors.card },
        isInCategoryView && styles.categoryViewItem // Aplica margem horizontal
      ]}
    >
      <View style={styles.songContent}>
        <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{song.title}</Text>
        {song.artist && (
          <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>{song.artist}</Text>
        )}
      </View>
      <ChevronRight size={22} color={colors.textLight} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  // Estilo aplicado quando o item está dentro da tela de detalhes de uma categoria
  categoryViewItem: {
    marginHorizontal: 20, // Adiciona margens laterais para alinhar com o título da tela
    marginBottom: 0,      // Remove a margem inferior para usar um separador
    borderRadius: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc', // Usar colors.border aqui seria o ideal
    paddingHorizontal: 0, // Remove padding para ocupar a largura toda
  },
  songContent: {
    flex: 1,
    marginRight: 12,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  songArtist: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default React.memo(SongListItem);
