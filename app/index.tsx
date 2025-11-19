
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Search, ListMusic, FolderTree, Bell } from 'lucide-react-native';
import React, { useState, useCallback, memo, useEffect, lazy, Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Notification } from '../components/NotificationPopover';
import SongListItem from '../components/SongListItem';
import Colors from '../constants/colors';
import { useApp } from '../contexts/AppContext';

const NotificationPopover = lazy(() => import('../components/NotificationPopover'));
const FloatingNavMenu = lazy(() => import('../components/FloatingNavMenu'));

// --- Componente de Cartão para Ação Rápida ---
const QuickActionCard = memo(({
  icon: Icon,
  title,
  subtitle,
  colors,
  onPress
}: { 
  icon: React.ComponentType<any>; 
  title: string; 
  subtitle: string; 
  colors: typeof Colors.light; 
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.quickCard, { backgroundColor: colors.card }]}
    onPress={onPress}
  >
    <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
      <Icon size={28} color={colors.secondary} />
    </View>
    <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
    <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
      {subtitle}
    </Text>
  </TouchableOpacity>
));
QuickActionCard.displayName = 'QuickActionCard';

const sampleNotifications: Notification[] = [
  { id: 1, message: 'Nova música "Grande é o Senhor" adicionada.', timestamp: '5 min atrás', read: false },
  { id: 2, message: 'A categoria "Adoração" foi atualizada.', timestamp: '2 horas atrás', read: true },
  { id: 3, message: 'Não se esqueça do ensaio do coral amanhã!', timestamp: '1 dia atrás', read: false },
];

const NOTIFICATIONS_STORAGE_KEY = '@cantico_novo_notifications';

// --- Tela Principal ---
export default function HomeScreen() {
  const {
    isDarkMode,
    filteredSongs,
    recentSongs,
    searchQuery,
    setSearchQuery,
    isLoading,
    addToQuickAccess,
    removeFromQuickAccess,
    quickAccessSongs
  } = useApp();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPopoverVisible, setPopoverVisible] = useState(false);

  const colors = isDarkMode ? Colors.dark : Colors.light;

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications));
        } else {
          setNotifications(sampleNotifications);
          await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(sampleNotifications));
        }
      } catch (error) {
        console.error("Failed to load notifications from storage", error);
        setNotifications(sampleNotifications);
      }
    };

    loadNotifications();
  }, []);

  const handleSearch = useCallback((text: string) => {
    setLocalSearch(text);
    setSearchQuery(text);
  }, [setSearchQuery]);

  const navigateToSong = useCallback((songId: number) => router.push(`/song/${songId}`), []);
  const navigateToAllSongs = useCallback(() => router.push('/all-songs'), []);
  const navigateToCategories = useCallback(() => router.push('/categories'), []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClearNotification = async (id: number) => {
    const newNotifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(newNotifications);
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(newNotifications));
    } catch (error) {
      console.error("Failed to save notifications to storage", error);
    }
  };

  const handleClearAllNotifications = async () => {
    const readNotifications = notifications.map(n => ({...n, read: true}));
    setNotifications(readNotifications);
    setPopoverVisible(false);
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(readNotifications));
    } catch (error) {
      console.error("Failed to save notifications to storage", error);
    }
  };

  const togglePopover = () => setPopoverVisible(!isPopoverVisible);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
                <View>
                  <Text style={[styles.greeting, { color: colors.secondary }]}>Bem-vindo ao</Text>
                  <Text style={styles.title}>Cântico Novo</Text>
                </View>
                <TouchableOpacity style={[styles.notificationButton, { backgroundColor: colors.secondary }]} onPress={togglePopover}>
                  <Bell size={22} color={colors.primary} />
                  {unreadCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.error, borderColor: colors.secondary }]}>
                      <Text style={[styles.badgeText, { color: colors.secondary }]}>{unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
            </View>
            <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
                <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Buscar músicas, letras, cifras..."
                  placeholderTextColor={colors.textLight}
                  value={localSearch}
                  onChangeText={handleSearch}
                />
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {searchQuery.trim() !== '' ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Resultados ({filteredSongs.length})</Text>
              {filteredSongs.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: colors.card }]}><Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhuma música encontrada</Text></View>
              ) : (
                filteredSongs.map(song => {
                  const isInQuickAccess = quickAccessSongs.some(s => s.id === song.id);
                  return (
                    <SongListItem
                      key={song.id}
                      song={song}
                      colors={colors}
                      onPress={() => navigateToSong(song.id)}
                      onAddToQueue={() => addToQuickAccess(song.id)}
                      onRemoveFromQueue={() => removeFromQuickAccess(song.id)}
                      onEdit={() => router.push(`/song-form?songId=${song.id}`)}
                      isInCategoryView={false}
                      isSongInQueue={isInQuickAccess}
                    />
                  );
                })
              )}
            </View>
          ) : (
            <>
              <View style={styles.cardsRow}>
                <QuickActionCard icon={ListMusic} title="Lista Completa" subtitle="Ver todas" colors={colors} onPress={navigateToAllSongs} />
                <QuickActionCard icon={FolderTree} title="Categorias" subtitle="Organizar" colors={colors} onPress={navigateToCategories} />
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Músicas Recentes</Text>
                {recentSongs.map(song => {
                  const isInQuickAccess = quickAccessSongs.some(s => s.id === song.id);
                  return (
                    <SongListItem
                      key={song.id}
                      song={song}
                      colors={colors}
                      onPress={() => navigateToSong(song.id)}
                      onAddToQueue={() => addToQuickAccess(song.id)}
                      onRemoveFromQueue={() => removeFromQuickAccess(song.id)}
                      onEdit={() => router.push(`/song-form?songId=${song.id}`)}
                      isInCategoryView={false}
                      isSongInQueue={isInQuickAccess}
                    />
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
        
        <Suspense fallback={null}>
          <FloatingNavMenu />
        </Suspense>

        {isPopoverVisible && (
          <Suspense fallback={null}>
            <NotificationPopover 
              notifications={notifications} 
              onClose={() => setPopoverVisible(false)} 
              onClear={handleClearNotification} 
              onClearAll={handleClearAllNotifications} 
            />
          </Suspense>
        )}
      </SafeAreaView>
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { paddingBottom: 24 },
  headerContent: { paddingHorizontal: 20, paddingTop: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '700', color: '#ffffff', letterSpacing: 0.5 },
  notificationButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: -2, right: -2, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, height: 52, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '500' },
  content: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 110 },
  cardsRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  quickCard: { flex: 1, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  iconContainer: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, fontWeight: '500' },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, letterSpacing: 0.3 },
  emptyCard: { borderRadius: 12, padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 15, fontWeight: '500' },
});
