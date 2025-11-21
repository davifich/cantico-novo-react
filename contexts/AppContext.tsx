
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useMemo, 
  useCallback, 
  ReactNode 
} from 'react';
import { useColorScheme } from 'react-native';
import { 
  addSong, 
  getAllSongs, 
  getAllCategories, 
  deleteSong, 
  updateSongInDb, 
  addCategory as addCategoryToDb,
  deleteCategory as deleteCategoryFromDb
} from '../lib/database';
import { Music, Category, AddSongDTO, UpdateSongDTO } from '../types/music';
import { filterSongs } from '../utils/search';

const QUICK_ACCESS_STORAGE_KEY = '@cantico_novo_quick_access';

interface AppContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  songs: Music[];
  categories: Category[];
  filteredSongs: Music[];
  recentSongs: Music[];
  quickAccessSongs: Music[];
  quickAccessIds: Set<number>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  error: string | null;
  addSong: (song: AddSongDTO) => Promise<number>; // CORREÇÃO: Deve retornar o ID da nova música
  updateSong: (id: number, song: UpdateSongDTO) => Promise<void>;
  deleteSong: (id: number) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  addToQuickAccess: (songId: number) => void;
  removeFromQuickAccess: (songId: number) => void;
  toggleQuickAccess: (songId: number) => void;
  markSongAsPlayed: (songId: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark')

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const [songs, setSongs] = useState<Music[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  const [quickAccessIds, setQuickAccessIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [loadedSongs, loadedCategories, storedQuickAccess] = await Promise.all([
          getAllSongs(),
          getAllCategories(),
          AsyncStorage.getItem(QUICK_ACCESS_STORAGE_KEY)
        ]);

        setSongs(loadedSongs);
        setCategories(loadedCategories);

        if (storedQuickAccess) {
          setQuickAccessIds(new Set(JSON.parse(storedQuickAccess)));
        }
        setError(null);
      } catch (e) {
        setError('Falha ao carregar os dados.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(QUICK_ACCESS_STORAGE_KEY, JSON.stringify(Array.from(quickAccessIds)));
  }, [quickAccessIds]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const refreshData = useCallback(async () => {
      try {
        setIsLoading(true);
        const [loadedSongs, loadedCategories] = await Promise.all([getAllSongs(), getAllCategories()]);
        setSongs(loadedSongs);
        setCategories(loadedCategories);
        setError(null);
      } catch (e) {
        setError('Falha ao carregar os dados.');
      } finally {
        setIsLoading(false);
      }
  }, []);

  // CORREÇÃO: A função agora retorna o ID recebido e tem o tipo de retorno explícito.
  const handleAddSong = async (song: AddSongDTO): Promise<number> => {
    const newId = await addSong(song);
    await refreshData();
    return newId;
  };

  const handleUpdateSong = async (id: number, songData: UpdateSongDTO) => {
    const originalSongs = songs;
    setSongs(prev => prev.map(s => s.id === id ? { ...s, ...songData } as Music : s));
    await updateSongInDb(id, songData).catch(async () => {
      setError("Falha ao atualizar. Restaurando dados.");
      setSongs(originalSongs); 
    });
  };

  const handleDeleteSong = async (id: number) => {
    setSongs(prev => prev.filter(s => s.id !== id)); 
    await deleteSong(id).catch(async () => {
      setError("Falha ao deletar. Restaurando dados.");
      await refreshData(); 
    });
  };

  const handleAddCategory = async (category: Omit<Category, 'id'>) => {
    try {
      await addCategoryToDb(category);
      await refreshData();
    } catch (err) {
      setError("Falha ao adicionar a categoria. Verifique se o nome já existe.");
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const originalCategories = categories;
    setCategories(prev => prev.filter(c => c.id !== id));
    try {
      await deleteCategoryFromDb(id);
      await refreshData(); 
    } catch (err) {
      setError("Falha ao deletar a categoria. Restaurando...");
      console.error(err);
      setCategories(originalCategories);
    }
  };

  const addToQuickAccess = useCallback((songId: number) => {
    setQuickAccessIds(prev => {
      const newSet = new Set(prev);
      newSet.add(songId);
      return newSet;
    });
  }, []);

  const removeFromQuickAccess = useCallback((songId: number) => {
    setQuickAccessIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(songId);
      return newSet;
    });
  }, []);

  const toggleQuickAccess = useCallback((songId: number) => {
    setQuickAccessIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(songId)) {
        newSet.delete(songId);
      } else {
        newSet.add(songId);
      }
      return newSet;
    });
  }, []);

  const markSongAsPlayed = useCallback(async (songId: number) => {
    const timestamp = Date.now();
    handleUpdateSong(songId, { last_played: timestamp });
  }, [handleUpdateSong]);

  const filteredSongs = useMemo(() => {
    return filterSongs(songs, debouncedQuery);
  }, [songs, debouncedQuery]);

  const recentSongs = useMemo(() => 
    [...songs]
      .filter(s => s.last_played)
      .sort((a, b) => (b.last_played ?? 0) - (a.last_played ?? 0))
      .slice(0, 10),
  [songs]);

  const quickAccessSongs = useMemo(() => songs.filter(s => quickAccessIds.has(s.id)), [
    songs,
    quickAccessIds,
  ]);

  const value: AppContextType = {
    isDarkMode,
    toggleTheme,
    songs,
    categories,
    filteredSongs,
    recentSongs,
    quickAccessSongs,
    quickAccessIds,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    addSong: handleAddSong,
    updateSong: handleUpdateSong,
    deleteSong: handleDeleteSong,
    addCategory: handleAddCategory,
    deleteCategory: handleDeleteCategory,
    addToQuickAccess,
    removeFromQuickAccess,
    toggleQuickAccess,
    markSongAsPlayed,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
