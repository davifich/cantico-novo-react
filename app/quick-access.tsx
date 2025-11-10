
import { router } from 'expo-router';
import { XCircle } from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import FloatingNavMenu from '@/components/FloatingNavMenu';
import SongListItem from '@/components/SongListItem';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function QuickAccessScreen() {
  const { isDarkMode, quickAccessSongs, removeFromQuickAccess, recentSongs } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const handleRemovePress = (songId: number, songTitle: string) => {
    Alert.alert(
      'Remover Acesso Rápido',
      `Tem certeza que deseja remover "${songTitle}" do acesso rápido?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => removeFromQuickAccess(songId),
        },
      ]
    );
  };

  const renderQuickAccessItem = ({ item }: { item: typeof quickAccessSongs[0] }) => (
    <View style={styles.quickAccessItemContainer}>
      <SongListItem
        song={item}
        colors={colors}
        onPress={() => router.push(`/song/${item.id}`)}
      />
      <TouchableOpacity 
        onPress={() => handleRemovePress(item.id, item.title)} 
        style={styles.removeButton}
      >
        {/* CORREÇÃO: A propriedade correta é 'error', não 'warning' */}
        <XCircle size={22} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={[styles.title, { color: colors.text }]}>Acesso Rápido</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Músicas adicionadas para acesso em 24h. Pressione e segure em uma música para adicionar.
      </Text>
    </View>
  );

  const ListFooter = () => (
    <View style={styles.footerContainer}>
      <Text style={[styles.recentTitle, { color: colors.text }]}>Adicionadas Recentemente</Text>
      {recentSongs.map(song => (
        <SongListItem
          key={song.id}
          song={song}
          colors={colors}
          onPress={() => router.push(`/song/${song.id}`)}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={quickAccessSongs}
        renderItem={renderQuickAccessItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={<ListHeader />}
        ListFooterComponent={quickAccessSongs.length > 0 ? <ListFooter /> : null}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhuma música no acesso rápido.
            </Text>
            <ListFooter />
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
      <FloatingNavMenu />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 120, 
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  quickAccessItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 40,
  },
  footerContainer: {
    marginTop: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc', 
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
});
