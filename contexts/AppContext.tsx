
import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  ReactNode, 
  Dispatch,
  SetStateAction
} from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import * as DB from '@/lib/database';
import { Music, Category, AddSongDTO } from '@/types/music';

// --- Definição de Tipos ---

interface QuickAccessItem {
  songId: number;
  addedAt: number;
}

interface AppContextType {
  isLoading: boolean;
  isDarkMode: boolean;
  isOnline: boolean; 
  toggleTheme: () => Promise<void>;
  songs: Music[];
  categories: Category[];
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  filteredSongs: Music[];
  recentSongs: Music[];
  quickAccessSongs: Music[];
  addToQuickAccess: (songId: number) => Promise<void>;
  removeFromQuickAccess: (songId: number) => Promise<void>;
  addSong: (song: AddSongDTO) => Promise<number | null>;
  deleteSong: (id: number) => Promise<void>;
  refreshSongs: () => Promise<void>;
  addCategory: (name: string, color: string) => Promise<number | null>;
  deleteCategory: (id: number) => Promise<void>;
  refreshCategories: () => Promise<void>;
  addSongToCategory: (songId: number, categoryId: number) => Promise<void>;
  removeSongFromCategory: (songId: number, categoryId: number) => Promise<void>;
}

// --- Contexto e Provider ---

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [isOnline, setIsOnline] = useState(true);

  const [songs, setSongs] = useState<Music[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickAccess, setQuickAccess] = useState<QuickAccessItem[]>([]);

  // --- Efeitos ---

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        await DB.initDatabase();
        await Promise.all([
          refreshSongs(), 
          refreshCategories(),
          loadQuickAccess(),
        ]);
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          setIsDarkMode(Appearance.getColorScheme() === 'dark');
        }
      } catch (error) {
        console.error('[AppContext] Falha na inicialização:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();

    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => {
      unsubscribeNetInfo();
    };
  }, []);

  // --- Funções de Manipulação de Dados ---

  const refreshSongs = useCallback(async () => {
    // CORREÇÃO: Usando o nome correto da função do banco de dados.
    const allSongs = await DB.getAllSongs();
    setSongs(allSongs);
  }, []);

  const refreshCategories = useCallback(async () => {
    // CORREÇÃO: Usando o nome correto da função do banco de dados.
    const allCategories = await DB.getAllCategories();
    setCategories(allCategories);
  }, []);

  const addSong = useCallback(async (song: AddSongDTO): Promise<number | null> => {
    try {
      const newSongId = await DB.addSong(song);
      await refreshSongs();
      return newSongId;
    } catch (error) {
      console.error('[AppContext] Falha ao adicionar música:', error);
      return null;
    }
  }, [refreshSongs]);

  const deleteSong = useCallback(async (id: number) => {
    try {
      await DB.deleteSong(id);
      await refreshSongs();
    } catch (error) {
      console.error('[AppContext] Falha ao deletar música:', error);
    }
  }, [refreshSongs]);

  const addCategory = useCallback(async (name: string, color: string): Promise<number | null> => {
    try {
      const newCategoryId = await DB.addCategory({ name, color });
      await refreshCategories();
      return newCategoryId;
    } catch (error) {
      console.error('[AppContext] Falha ao adicionar categoria:', error);
      return null;
    }
  }, [refreshCategories]);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      await DB.deleteCategory(id);
      await Promise.all([refreshCategories(), refreshSongs()]);
    } catch (error) {
      console.error('[AppContext] Falha ao deletar categoria:', error);
    }
  }, [refreshCategories, refreshSongs]);

  const addSongToCategory = useCallback(async (songId: number, categoryId: number) => {
    try {
      await DB.addSongToCategory(songId, categoryId);
      await refreshSongs();
    } catch (error) {
      console.error(`[AppContext] Falha ao adicionar música ${songId} à categoria ${categoryId}:`, error);
      throw error;
    }
  }, [refreshSongs]);

  const removeSongFromCategory = useCallback(async (songId: number, categoryId: number) => {
    try {
      await DB.removeSongFromCategory(songId, categoryId);
      await refreshSongs();
    } catch (error) {
      console.error(`[AppContext] Falha ao remover música ${songId} da categoria ${categoryId}:`, error);
      throw error;
    }
  }, [refreshSongs]);

  const loadQuickAccess = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('@quickAccessSongs');
      if (stored) {
        const items: QuickAccessItem[] = JSON.parse(stored);
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const validItems = items.filter(item => (now - item.addedAt) < twentyFourHours);
        setQuickAccess(validItems);
        if (validItems.length < items.length) {
          await AsyncStorage.setItem('@quickAccessSongs', JSON.stringify(validItems));
        }
      }
    } catch (error) {
      console.error('[AppContext] Falha ao carregar Acesso Rápido:', error);
    }
  }, []);

  const addToQuickAccess = useCallback(async (songId: number) => {
    const isAlreadyAdded = quickAccess.some(item => item.songId === songId);
    if (isAlreadyAdded || quickAccess.length >= 10) return;

    const newItem: QuickAccessItem = { songId, addedAt: Date.now() };
    const updatedList = [...quickAccess, newItem];
    
    setQuickAccess(updatedList);
    await AsyncStorage.setItem('@quickAccessSongs', JSON.stringify(updatedList));
  }, [quickAccess]);

  const removeFromQuickAccess = useCallback(async (songId: number) => {
    const updatedList = quickAccess.filter(item => item.songId !== songId);
    setQuickAccess(updatedList);
    await AsyncStorage.setItem('@quickAccessSongs', JSON.stringify(updatedList));
  }, [quickAccess]);
  
  const toggleTheme = useCallback(async () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    await AsyncStorage.setItem('theme', newTheme);
  }, [isDarkMode]);

  const filteredSongs = useMemo(() =>
    songs.filter(song => 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [songs, searchQuery]);

  const recentSongs = useMemo(() => 
    [...songs].sort((a, b) => b.id - a.id).slice(0, 5), 
    [songs]
  );

  const quickAccessSongs = useMemo(() => 
    quickAccess
      .map(item => songs.find(s => s.id === item.songId))
      .filter((s): s is Music => s !== undefined), 
    [quickAccess, songs]
  );

  const value = useMemo(
    () => ({
      isLoading,
      isDarkMode,
      isOnline,
      toggleTheme,
      songs,
      categories,
      searchQuery,
      setSearchQuery,
      filteredSongs,
      recentSongs,
      quickAccessSongs,
      addToQuickAccess,
      removeFromQuickAccess,
      addSong,
      deleteSong,
      refreshSongs,
      addCategory,
      deleteCategory,
      refreshCategories,
      addSongToCategory,
      removeSongFromCategory,
    }),
    [
      isLoading, isDarkMode, isOnline, toggleTheme, songs, categories, searchQuery, 
      filteredSongs, recentSongs, quickAccessSongs, addToQuickAccess, removeFromQuickAccess,
      addSong, deleteSong, refreshSongs, addCategory, deleteCategory, refreshCategories,
      addSongToCategory, removeSongFromCategory
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
