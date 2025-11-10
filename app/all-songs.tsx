
import { router } from 'expo-router';
import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SongListItem from '@/components/SongListItem'; // Importa o componente reutilizável
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Music } from '@/types/music';

interface GroupedSongs {
  [letter: string]: Music[];
}

export default function AllSongsScreen() {
  const { isDarkMode, songs } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const groupedSongs = useMemo(() => {
    return songs.reduce((acc, song) => {
      const firstLetter = song.title[0]?.toUpperCase() || '#';
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(song);
      return acc;
    }, {} as GroupedSongs);
  }, [songs]);

  const navigateToSong = useCallback((id: string) => {
    router.push(`/song/${id}`);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Todas as Músicas</Text>
        </View>

        {songs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhuma música encontrada.
            </Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
              Importe ou crie novas músicas para começar.
            </Text>
          </View>
        ) : (
          <ScrollView>
            {Object.keys(groupedSongs)
              .sort()
              .map((letter) => (
                <View key={letter} style={styles.section}>
                  <View style={[styles.letterHeader, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.letterText, { color: colors.secondary }]}>{letter}</Text>
                  </View>
                  {groupedSongs[letter].map((song) => (
                    <SongListItem
                      key={song.id}
                      song={song}
                      colors={colors}
                      onPress={() => navigateToSong(song.id.toString())}
                    />
                  ))}
                </View>
              ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

// A definição local do componente foi removida daqui

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
  section: {
    marginBottom: 16,
  },
  letterHeader: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    opacity: 0.9,
  },
  letterText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
