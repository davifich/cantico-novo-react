import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import * as DB from '@/lib/database';
import { Category, Music, QuickAccessItem } from '@/types/music';

const PREFERENCE_KEYS = {
  THEME: 'theme',
  QUICK_ACCESS: 'quickAccess',
} as const;

const defaultCategories: Pick<Category, 'name' | 'color'>[] = [
  { name: 'Tradicional', color: '#8B4513' },
  { name: 'Adoração', color: '#4169E1' },
  { name: 'Louvor', color: '#FFD700' },
  { name: 'Contemporânea', color: '#32CD32' },
  { name: 'Hinos', color: '#800080' },
];

export const [AppProvider, useApp] = createContextHook(() => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [songs, setSongs] = useState<Music[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [quickAccess, setQuickAccess] = useState<QuickAccessItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  const refreshSongs = useCallback(async () => {
    try {
      const dbSongs = await DB.getAllSongs();
      setSongs(dbSongs);
    } catch (error) {
      console.error('[AppContext] Failed to refresh songs:', error);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const dbCategories = await DB.getAllCategories();
      if (dbCategories.length === 0) {
        for (const cat of defaultCategories) {
          await DB.addCategory(cat);
        }
        const newDbCategories = await DB.getAllCategories();
        setCategories(newDbCategories);
      } else {
        setCategories(dbCategories);
      }
    } catch (error) {
      console.error('[AppContext] Failed to refresh categories:', error);
    }
  }, []);

  const loadPreferences = useCallback(async () => {
    try {
      const [themeValue, quickAccessValue] = await Promise.all([
        DB.getPreference(PREFERENCE_KEYS.THEME),
        DB.getPreference(PREFERENCE_KEYS.QUICK_ACCESS),
      ]);

      setIsDarkMode(themeValue ? JSON.parse(themeValue) : Appearance.getColorScheme() === 'dark');

      if (quickAccessValue) {
        let parsed = JSON.parse(quickAccessValue);

        const migratedItems = parsed.map((item: any) => ({
          ...item,
          musicId: typeof item.musicId === 'string' ? parseInt(item.musicId, 10) : item.musicId,
        }));

        const now = new Date().getTime();
        const validItems = migratedItems.filter(
          (item: QuickAccessItem) => 
            new Date(item.expiresAt).getTime() > now && !isNaN(item.musicId)
        );
        
        setQuickAccess(validItems);

        if (validItems.length !== parsed.length) {
          await DB.setPreference(PREFERENCE_KEYS.QUICK_ACCESS, validItems);
        }
      }
    } catch (error) {
      console.error('[AppContext] Failed to load preferences:', error);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await DB.initDatabase();
        await Promise.all([refreshSongs(), refreshCategories(), loadPreferences()]);
      } catch (error) {
        console.error('[AppContext] Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [refreshSongs, refreshCategories, loadPreferences]);

  const toggleTheme = useCallback(async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await DB.setPreference(PREFERENCE_KEYS.THEME, newTheme);
    } catch (error) {
      console.error('[AppContext] Failed to toggle theme:', error);
    }
  }, [isDarkMode]);

  const addCategory = useCallback(async (name: string, color: string) => {
    try {
      if (!name.trim() || categories.some(c => c.name.toLowerCase() === name.trim().toLowerCase())) return;
      await DB.addCategory({ name: name.trim(), color });
      await refreshCategories();
    } catch (error) {
      console.error('[AppContext] Failed to add category:', error);
    }
  }, [categories, refreshCategories]);

  const updateCategory = useCallback(async (id: number, name: string, color: string) => {
    try {
      const categoryToUpdate = categories.find(c => c.id === id);
      if (!categoryToUpdate) return;

      if (categoryToUpdate.status === 'synced' && !isOnline) {
        console.warn('Bloqueado: Não é possível editar uma categoria sincronizada em modo offline.');
        // Aqui você pode adicionar um feedback para o usuário (ex: Toast)
        return;
      }

      if (!name.trim()) return;
      await DB.updateCategory(id, { name: name.trim(), color });
      await refreshCategories();
    } catch (error) {
      console.error('[AppContext] Failed to update category:', error);
    }
  }, [categories, isOnline, refreshCategories]);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      await DB.deleteCategory(id);
      await refreshCategories();
    } catch (error) {
      console.error('[AppContext] Failed to delete category:', error);
    }
  }, [refreshCategories]);

  const addSong = useCallback(async (song: Partial<Omit<Music, 'id'>>) => {
    try {
      const newSongId = await DB.addSong(song);
      await refreshSongs();
      return newSongId;
    } catch (error) {
      console.error('[AppContext] Failed to add song:', error);
      return null;
    }
  }, [refreshSongs]);

  const updateSong = useCallback(async (songId: number, data: Partial<Omit<Music, 'id'>>) => {
    try {
      const songToUpdate = songs.find(s => s.id === songId);
      if (!songToUpdate) return;

      if (songToUpdate.status === 'synced' && !isOnline) {
        console.warn('Bloqueado: Não é possível editar uma música sincronizada em modo offline.');
        // Aqui você pode adicionar um feedback para o usuário (ex: Toast)
        return;
      }

      await DB.updateSong(songId, data);
      await refreshSongs();
    } catch (error) {
      console.error('[AppContext] Failed to update song:', error);
    }
  }, [songs, isOnline, refreshSongs]);

  const addSongToCategory = useCallback(async (songId: number, categoryName: string) => {
    try {
      const song = songs.find(s => s.id === songId);
      if (song && !song.categories.includes(categoryName.toLowerCase())) {
        const updatedCategories = [...song.categories, categoryName.toLowerCase()];
        await updateSong(songId, { categories: updatedCategories });
      }
    } catch (error) {
      console.error('[AppContext] Failed to add song to category:', error);
    }
  }, [songs, updateSong]);

  const removeSongFromCategory = useCallback(async (songId: number, categoryName: string) => {
    try {
      const song = songs.find(s => s.id === songId);
      if (song) {
        const updatedCategories = song.categories.filter(cat => cat !== categoryName.toLowerCase());
        await updateSong(songId, { categories: updatedCategories });
      }
    } catch (error) {
      console.error('[AppContext] Failed to remove song from category:', error);
    }
  }, [songs, updateSong]);

  const addToQuickAccess = useCallback(async (musicId: number) => {
    try {
      if (quickAccess.length >= 10 || quickAccess.some(item => item.musicId === musicId)) return;
      const expiresAt = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      const newItem: QuickAccessItem = {
        musicId,
        addedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
      };
      const updated = [...quickAccess, newItem];
      setQuickAccess(updated);
      await DB.setPreference(PREFERENCE_KEYS.QUICK_ACCESS, updated);
    } catch (error) {
      console.error('[AppContext] Failed to add to quick access:', error);
    }
  }, [quickAccess]);

  const removeFromQuickAccess = useCallback(async (musicId: number) => {
    try {
      const updated = quickAccess.filter(item => item.musicId !== musicId);
      setQuickAccess(updated);
      await DB.setPreference(PREFERENCE_KEYS.QUICK_ACCESS, updated);
    } catch (error) {
      console.error('[AppContext] Failed to remove from quick access:', error);
    }
  }, [quickAccess]);

  const reorderQuickAccess = useCallback(async (items: QuickAccessItem[]) => {
    try {
      if (!Array.isArray(items)) return;
      setQuickAccess(items);
      await DB.setPreference(PREFERENCE_KEYS.QUICK_ACCESS, items);
    } catch (error) {
      console.error('[AppContext] Failed to reorder quick access:', error);
    }
  }, []);

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;
    const query = searchQuery.toLowerCase().trim();
    return songs.filter(song => 
      song.title.toLowerCase().includes(query) ||
      (song.artist && song.artist.toLowerCase().includes(query)) ||
      (song.letra && song.letra.toLowerCase().includes(query))
    );
  }, [songs, searchQuery]);

  const recentSongs = useMemo(() => {
    return [...songs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [songs]);

  const quickAccessSongs = useMemo(() => {
    return quickAccess
      .map(item => songs.find(song => song.id === item.musicId))
      .filter((song): song is Music => song !== undefined);
  }, [quickAccess, songs]);

  return useMemo(
    () => ({
      isDarkMode,
      toggleTheme,
      isOnline,
      songs,
      categories,
      quickAccess,
      searchQuery,
      setSearchQuery,
      isLoading,
      addCategory,
      updateCategory,
      deleteCategory,
      addSong,
      updateSong,
      addSongToCategory,
      removeSongFromCategory,
      addToQuickAccess,
      removeFromQuickAccess,
      reorderQuickAccess,
      filteredSongs,
      recentSongs,
      quickAccessSongs,
      refreshSongs,
      refreshCategories,
    }),
    [
      isDarkMode, toggleTheme, isOnline, songs, categories, quickAccess, searchQuery, isLoading, addCategory, updateCategory,
      deleteCategory, addSong, updateSong, addSongToCategory, removeSongFromCategory, addToQuickAccess, removeFromQuickAccess,
      reorderQuickAccess, filteredSongs, recentSongs, quickAccessSongs, refreshSongs, refreshCategories,
    ]
  );
});
