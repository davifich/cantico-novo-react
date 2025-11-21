
import { Music } from '@/types/music';
import { AudioWaveform, MusicIcon, Search } from 'lucide-react-native';
import React, { useMemo, useState, useEffect } from 'react'; // Importado useEffect
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'; // Importado ActivityIndicator
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { getAllKaraokeSongs } from '@/lib/database'; // Importada a nova função

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSelectSong: (song: Music) => void;
  onLongPressSong?: (song: Music) => void;
  filter?: 'all' | 'karaoke'; // **MODIFICAÇÃO DO PLANO DE AÇÃO**
}

export default function SongSelectionModal({ isVisible, onClose, onSelectSong, onLongPressSong, filter = 'all' }: Props) {
  const { songs, isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const [searchQuery, setSearchQuery] = useState('');
  
  // **MODIFICAÇÃO DO PLANO DE AÇÃO**
  // Novo estado para carregar e armazenar as músicas de karaokê
  const [karaokeSongs, setKaraokeSongs] = useState<Music[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carrega as músicas de karaokê quando o modal se torna visível e o filtro é 'karaoke'
  useEffect(() => {
    if (filter === 'karaoke' && isVisible) {
      setIsLoading(true);
      getAllKaraokeSongs()
        .then(setKaraokeSongs)
        .catch(err => console.error("Falha ao buscar músicas de karaokê:", err))
        .finally(() => setIsLoading(false));
    }
  }, [filter, isVisible]);

  const filteredSongs = useMemo(() => {
    // Decide qual lista de músicas usar com base no filtro
    const sourceSongs = filter === 'karaoke' ? karaokeSongs : songs;

    if (!searchQuery) return sourceSongs;
    return sourceSongs.filter(song => 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.artist && song.artist.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [songs, karaokeSongs, searchQuery, filter]);

  const handleSelect = (song: Music) => {
    onSelectSong(song);
    onClose();
  };

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />;
    }
    
    return (
        <FlatList
          data={filteredSongs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.songItem}
              onPress={() => handleSelect(item)}
              onLongPress={() => onLongPressSong?.(item)}
              disabled={isLoading} // Desabilita o toque durante o carregamento
            >
              <View style={{ marginRight: 15 }}>
                {item.is_karaoke ? 
                  <AudioWaveform size={24} color={colors.primary} /> : 
                  <MusicIcon size={24} color={colors.textSecondary} />
                }
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.songTitle, { color: colors.text }]}>{item.title}</Text>
                {item.artist && <Text style={[styles.songArtist, { color: colors.textSecondary }]}>{item.artist}</Text>}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>Nenhuma música encontrada.</Text>}
        />
    );
  }

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Selecione uma Música</Text>
            <TouchableOpacity onPress={onClose}><Text style={{ color: colors.primary }}>Fechar</Text></TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Buscar por título ou artista..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>
        {renderContent()}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    fontSize: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  songTitle: {
    fontSize: 18,
  },
  songArtist: {
    fontSize: 14,
    marginTop: 2,
  },
});
