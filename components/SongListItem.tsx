
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import Colors from '../constants/colors';
import { Music } from '../types/music';

interface SongListItemProps {
  song: Music;
  colors: typeof Colors.light;
  onPress: () => void;
  isInCategoryView?: boolean;
}

const SongListItem: React.FC<SongListItemProps> = ({ song, colors, onPress, isInCategoryView }) => {
  // Formata o título para incluir o código, se existir
  const displayTitle = song.code ? `${song.code} - ${song.title}` : song.title;

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.songCard, 
        { backgroundColor: colors.card },
        isInCategoryView && styles.categoryViewItem
      ]}
    >
      <View style={styles.songContent}>
        <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{displayTitle}</Text>
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
  categoryViewItem: {
    marginHorizontal: 20,
    marginBottom: 0,
    borderRadius: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    paddingHorizontal: 0,
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
