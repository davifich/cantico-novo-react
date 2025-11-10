
import { Stack, useLocalSearchParams } from 'expo-router';
import { ZoomIn, ZoomOut, Plus, Check, MoreVertical } from 'lucide-react-native';
import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import Pdf from 'react-native-pdf';

import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Music } from '@/types/music';
import { getPreference, setPreference } from '@/lib/database';
import ViewSelectorMenu from '@/components/ViewSelectorMenu';

const ZOOM_LEVELS = [1, 1.15, 1.3] as const;

export default function SongScreen() {
  const { id: idString } = useLocalSearchParams<{ id: string }>();
  const id = useMemo(() => (idString ? parseInt(idString, 10) : NaN), [idString]);

  const { isDarkMode, songs, quickAccessSongs, addToQuickAccess, removeFromQuickAccess, isOnline } = useApp();
  const colors = useMemo(() => (isDarkMode ? Colors.dark : Colors.light), [isDarkMode]);

  const [song, setSong] = useState<Music | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'letra' | 'cifra' | 'partitura'>('letra');
  const [zoomLevel, setZoomLevel] = useState(0);
  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    const currentSong = songs.find((s) => s.id === id);
    setSong(currentSong);

    if (currentSong) {
      // Carrega a última preferência de visualização para esta música
      getPreference(`song_${currentSong.id}_viewMode`).then(mode => {
        if (mode) {
          setViewMode(mode as any);
        }
      });
    }
  }, [songs, id]);

  const isEditDisabled = useMemo(() => {
    if (!song) return true;
    return song.status === 'synced' && !isOnline;
  }, [song, isOnline]);

  const isInQuickAccess = useMemo(() => {
    if (!song) return false;
    return quickAccessSongs.some((s) => s.id === song.id);
  }, [quickAccessSongs, song]);

  const canAddToQuickAccess = useMemo(() => {
    return quickAccessSongs.length < 10;
  }, [quickAccessSongs]);

  const handleOpenMenu = useCallback(() => {
    sheetRef.current?.expand();
  }, []);

  const handleSelectMode = useCallback((mode: 'letra' | 'cifra' | 'partitura') => {
    setViewMode(mode);
    setPreference(`song_${id}_viewMode`, mode);
    sheetRef.current?.close();
  }, [id]);

  const handleZoomIn = useCallback(() => {
    if (zoomLevel < ZOOM_LEVELS.length - 1) {
      setZoomLevel(zoomLevel + 1);
    }
  }, [zoomLevel]);

  const handleZoomOut = useCallback(() => {
    if (zoomLevel > 0) {
      setZoomLevel(zoomLevel - 1);
    }
  }, [zoomLevel]);

  const handleToggleQuickAccess = useCallback(() => {
    if (!song) return;
    if (isInQuickAccess) {
      removeFromQuickAccess(song.id);
    } else if (canAddToQuickAccess) {
      addToQuickAccess(song.id);
    }
  }, [isInQuickAccess, canAddToQuickAccess, song, removeFromQuickAccess, addToQuickAccess]);

  const renderContent = () => {
    if (!song) return null;

    if (viewMode === 'partitura' && song.file_path) {
      return (
        <Pdf
          source={{ uri: song.file_path }}
          style={[styles.pdf, { backgroundColor: colors.background }]}
          trustAllCerts={false} // Important for local files on Android
        />
      );
    }

    const content = viewMode === 'letra' ? song.letra : song.cifra;

    if (content) {
      return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {song.artist && (
            <Text style={[styles.artist, { color: colors.textSecondary }]}>{song.artist}</Text>
          )}
          <Text style={[styles.lyrics, { color: colors.text, fontSize: 16 * ZOOM_LEVELS[zoomLevel] }]}>
            {content}
          </Text>
        </ScrollView>
      );
    }

    return (
      <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {`Nenhuma ${viewMode} disponível para esta música.`}
        </Text>
      </View>
    );
  };

  if (!song) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Música não encontrada' }} />
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: 10 }]}>
            Carregando música...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: song.title,
          headerRight: () => (
            <View style={styles.headerButtons}>
               <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: colors.card }]}
                onPress={handleOpenMenu}
              >
                <MoreVertical size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: colors.card }]}
                onPress={handleToggleQuickAccess}
                disabled={!isInQuickAccess && !canAddToQuickAccess}
              >
                {isInQuickAccess ? (
                  <Check size={20} color={colors.success} />
                ) : (
                  <Plus size={20} color={canAddToQuickAccess ? colors.text : colors.textLight} />
                )}
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {viewMode !== 'partitura' && (
        <View style={[styles.topBar, { backgroundColor: colors.surface }]}>
          <View style={styles.zoomControls}>
            <TouchableOpacity
              style={[styles.zoomButton, { backgroundColor: colors.card }, zoomLevel === 0 && styles.zoomButtonDisabled]}
              onPress={handleZoomOut}
              disabled={zoomLevel === 0}
            >
              <ZoomOut size={20} color={zoomLevel === 0 ? colors.textLight : colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.zoomButton, { backgroundColor: colors.card }, zoomLevel === ZOOM_LEVELS.length - 1 && styles.zoomButtonDisabled]}
              onPress={handleZoomIn}
              disabled={zoomLevel === ZOOM_LEVELS.length - 1}
            >
              <ZoomIn size={20} color={zoomLevel === ZOOM_LEVELS.length - 1 ? colors.textLight : colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isEditDisabled && (
        <View style={[styles.warningBanner, { backgroundColor: colors.warningContainer }]}>
          <Text style={[styles.warningText, { color: colors.warningText }]}>
            Modo offline: Edições estão desativadas.
          </Text>
        </View>
      )}

      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
      
      <ViewSelectorMenu 
        sheetRef={sheetRef} 
        hasPartitura={!!song.file_path}
        onSelectMode={handleSelectMode} 
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  zoomControls: {
    flexDirection: 'row',
    gap: 8,
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomButtonDisabled: {
    opacity: 0.5,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  artist: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  lyrics: {
    lineHeight: 28,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
    marginHorizontal: 20,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  warningBanner: {
    padding: 12,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
