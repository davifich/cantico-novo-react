
import { CirclePlus } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import Colors from '../constants/colors';
import { Music } from '../types/music';
import SongActPopover from './SongActPopover';

interface SongListItemProps {
  song: Music;
  colors: typeof Colors.light;
  onPress: () => void;
  onAddToQueue: () => void;
  onRemoveFromQueue: () => void; // New prop for removing from queue
  onEdit: () => void;
  isInCategoryView?: boolean;
  isSongInQueue: boolean; // New prop to determine the state
}

const SongListItem: React.FC<SongListItemProps> = ({ 
  song, 
  colors, 
  onPress, 
  onAddToQueue, 
  onRemoveFromQueue, 
  onEdit, 
  isInCategoryView, 
  isSongInQueue 
}) => {
  const [isPopoverVisible, setPopoverVisible] = useState(false);

  const displayTitle = song.code ? `${song.code} - ${song.title}` : song.title;

  const handleQueueAction = useCallback(() => {
    if (isSongInQueue) {
      onRemoveFromQueue();
    } else {
      onAddToQueue();
    }
    setPopoverVisible(false);
  }, [isSongInQueue, onAddToQueue, onRemoveFromQueue]);

  const handleEdit = () => {
    onEdit();
    setPopoverVisible(false);
  };

  const queueActionText = isSongInQueue ? "Remover da Fila" : "Adicionar à Fila";

  return (
    <>
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
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation();
            setPopoverVisible(true);
          }}
          style={styles.plusButton}
        >
          <CirclePlus size={24} color={colors.textLight} />
        </TouchableOpacity>
      </TouchableOpacity>
      <SongActPopover
        isVisible={isPopoverVisible}
        onClose={() => setPopoverVisible(false)}
        onEdit={handleEdit}
        colors={colors}
        // Pass dynamic props to the popover
        queueActionText={queueActionText}
        onQueueAction={handleQueueAction}
        isSongInQueue={isSongInQueue}
      />
    </>
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
  plusButton: {
    padding: 8,
    marginLeft: 'auto',
  }
});

export default React.memo(SongListItem);
