
import { CirclePlus, Mic } from 'lucide-react-native';
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import Colors from '../constants/colors';
import { Music } from '../types/music';
import SongActPopover from './SongActPopover';

const normalizeLyricsForSignature = (lyrics: any): string => {
  if (!lyrics) return '';
  const fullText = Array.isArray(lyrics) 
    ? lyrics.map(line => line.text || '').join(' ') 
    : String(lyrics);

  return fullText
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

interface SongListItemProps {
  song: Music;
  colors: typeof Colors.light;
  onPress: () => void;
  onAddToQueue: () => void;
  onRemoveFromQueue: () => void;
  onEdit: () => void;
  isInCategoryView?: boolean;
  isSongInQueue: boolean;
  // CORREÇÃO: Tornando as props para o atalho de karaokê opcionais
  allSongs?: Music[];
  onPressKaraoke?: (song: Music) => void;
}

const SongListItem: React.FC<SongListItemProps> = ({ 
  song, 
  allSongs, 
  colors, 
  onPress, 
  onAddToQueue, 
  onRemoveFromQueue, 
  onEdit, 
  onPressKaraoke, 
  isInCategoryView, 
  isSongInQueue 
}) => {
  const [isPopoverVisible, setPopoverVisible] = useState(false);

  const karaokeVersion = useMemo(() => {
    // O atalho só funciona se a lógica puder ser executada (props existem)
    if (!allSongs || !onPressKaraoke || song.is_karaoke || !song.letra) {
        return null;
    }
    
    const currentSignature = normalizeLyricsForSignature(song.letra);
    if (!currentSignature) return null;

    return allSongs.find(otherSong => 
      otherSong.is_karaoke && 
      otherSong.lyrics_karaoke &&
      normalizeLyricsForSignature(otherSong.lyrics_karaoke) === currentSignature
    );
  }, [song, allSongs, onPressKaraoke]);

  const displayTitle = song.code ? `${song.code} - ${song.title}` : song.title;

  const handleQueueAction = useCallback(() => {
    isSongInQueue ? onRemoveFromQueue() : onAddToQueue();
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

        <View style={styles.actionsContainer}>
          {/* O botão só renderiza se a versão karaokê for encontrada E a função de clique for fornecida */}
          {karaokeVersion && onPressKaraoke && (
            <TouchableOpacity 
              onPress={(e) => { 
                e.stopPropagation(); 
                onPressKaraoke(karaokeVersion); 
              }} 
              style={styles.actionButton}
            >
              <Mic size={24} color={colors.primary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              setPopoverVisible(true);
            }}
            style={styles.actionButton}
          >
            <CirclePlus size={24} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      <SongActPopover
        isVisible={isPopoverVisible}
        onClose={() => setPopoverVisible(false)}
        onEdit={handleEdit}
        colors={colors}
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
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  }
});

export default React.memo(SongListItem);
