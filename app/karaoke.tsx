import { useRouter } from 'expo-router';
import { AudioWaveform, Library, ListMusic } from 'lucide-react-native'; // Adicionado ListMusic
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

import { trpc } from '@/lib/trpc';
import { supabase } from '@/lib/supabase';
// Modificado para incluir as novas funções
import { addSong, updateSongInDb, deleteSong, findSongByLyricsSignature, generateNextPersonalizedCode, getAllKaraokeSongs } from '@/lib/database';
import SongSelectionModal from '@/components/SongSelectionModal';
import EditSongModal from '@/components/EditSongModal';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Music, AddSongDTO } from '@/types/music';

type TranscriptionVariables = {
  storagePath: string;
  fileName: string;
  audioUri: string;
};

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export default function KaraokeSelectionScreen() {
  const router = useRouter();
  const { isDarkMode, refreshData } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [isKaraokeListVisible, setKaraokeListVisible] = useState(false); // Novo estado para a lista de karaokê
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingSong, setEditingSong] = useState<Music | null>(null);

  const saveOrUpdateSong = async (songData: AddSongDTO, existingSong: Music | null) => {
    try {
        const duplicate = existingSong || await findSongByLyricsSignature(songData.lyrics_karaoke);

        if (duplicate) {
            Alert.alert(
                'Música Duplicada Encontrada',
                `A música "${duplicate.title}" parece ser idêntica. O que você gostaria de fazer?`,
                [
                    {
                        text: 'Sobrescrever',
                        onPress: async () => {
                            setProcessingMessage('Sobrescrevendo música...');
                            await updateSongInDb(duplicate.id, { ...songData });
                            await refreshData();
                            navigateToPlayer(duplicate.id, songData);
                        }
                    },
                    {
                        text: 'Salvar como Nova',
                        onPress: async () => {
                            setProcessingMessage('Gerando ID e salvando nova cópia...');
                            // **IMPLEMENTAÇÃO DO PLANO DE AÇÃO**
                            const newCode = await generateNextPersonalizedCode();
                            const songWithCode = { ...songData, code: newCode };
                            const newId = await addSong(songWithCode);
                            await refreshData();
                            navigateToPlayer(newId, songWithCode);
                        }
                    },
                    { text: 'Cancelar', style: 'cancel', onPress: () => setIsProcessing(false) },
                ]
            );
        } else {
            setProcessingMessage('Gerando ID e salvando música...');
            // **IMPLEMENTAÇÃO DO PLANO DE AÇÃO**
            const newCode = await generateNextPersonalizedCode();
            const songWithCode = { ...songData, code: newCode };
            const newId = await addSong(songWithCode);
            await refreshData();
            navigateToPlayer(newId, songWithCode);
        }
    } catch (error) {
        console.error('[Database Error] Erro ao salvar/atualizar a música:', error);
        Alert.alert('Erro', 'Não foi possível salvar a música no banco de dados.');
        setIsProcessing(false);
    }
  };

  const navigateToPlayer = (songId: number, songData: AddSongDTO) => {
    setProcessingMessage('Pronto!');
    router.push({
      pathname: '/player',
      params: {
        mode: 'karaoke', title: songData.title, audioUri: songData.audio_uri,
        lyricsData: JSON.stringify(songData.lyrics_karaoke), bpm: songData.bpm,
      },
    });
  };

  const transcriptionMutation = trpc.transcription.transcribe.useMutation({
    onSuccess: async (data) => {
      if (!data.fileName || !data.audioUri) {
        console.error('[tRPC Error] Resposta da mutação inválida', data);
        Alert.alert('Erro na Transcrição', 'O servidor retornou uma resposta inesperada.');
        setIsProcessing(false);
        return;
      }

      const newKaraokeSong: AddSongDTO = {
        title: data.fileName, 
        artist: 'Karaokê Importado',
        letra: null, cifra: null, has_cifra: false, has_partitura: false,
        is_karaoke: true, 
        audio_uri: data.audioUri, 
        bpm: data.bpm, 
        lyrics_karaoke: data.lyrics,
      };
      await saveOrUpdateSong(newKaraokeSong, null);
    },
    onError: (error) => {
      console.error('[tRPC Error]', error);
      Alert.alert('Erro na Transcrição', error.message);
      setIsProcessing(false);
    },
  });

  const handleImportAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
      if (result.canceled) return;
      
      const asset = result.assets[0];

      if (asset.size && asset.size > MAX_FILE_SIZE_BYTES) {
        Alert.alert(
          'Arquivo Muito Grande',
          `O arquivo selecionado excede o limite de 25MB. Por favor, escolha um arquivo menor.`,
          [{ text: 'OK' }]
        );
        return;
      }

      setIsProcessing(true);
      setProcessingMessage('Enviando áudio...');

      const fileContent = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
      const originalFileName = asset.name;
      const fileExtension = originalFileName.split('.').pop();
      const uniqueFileName = `${new Date().getTime()}.${fileExtension}`;
      const filePath = `public/${uniqueFileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('audio-uploads')
        .upload(filePath, decode(fileContent), { contentType: asset.mimeType });

      if (uploadError) throw uploadError;

      setProcessingMessage('Analisando música...');
      transcriptionMutation.mutate({ 
          storagePath: filePath, 
          fileName: originalFileName || 'Música Importada',
          audioUri: asset.uri,
       });

    } catch (error: any) {
      console.error('Erro no processo de importação:', error);
      Alert.alert('Ocorreu um erro', error.message || 'Por favor, tente novamente.');
      setIsProcessing(false);
    }
  };

  const handleSelectSong = async (song: Music) => {
    // Fechar ambos os modais ao selecionar
    setModalVisible(false);
    setKaraokeListVisible(false);

    if (song.is_karaoke) {
        if (song.audio_uri) {
            const fileInfo = await FileSystem.getInfoAsync(song.audio_uri);
            if (!fileInfo.exists) {
                Alert.alert(
                    'Arquivo de Áudio Faltando',
                    'O arquivo original não foi encontrado. Deseja remover esta entrada da biblioteca?',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        { 
                            text: 'Remover', 
                            style: 'destructive',
                            onPress: async () => {
                                await deleteSong(song.id);
                                await refreshData();
                            } 
                        },
                    ]
                );
                return;
            }
        }
        router.push({
            pathname: '/player',
            params: {
                mode: 'karaoke', title: song.title, audioUri: song.audio_uri,
                lyricsData: JSON.stringify(song.lyrics_karaoke), bpm: song.bpm,
            },
        });
    } else {
      // Lógica para modo leitor, se aplicável vindo de um modal geral
      router.push({
        pathname: '/player',
        params: { mode: 'reader', title: song.title, lyrics: song.letra },
      });
    }
  };

  const handleLongPressSong = (song: Music) => {
    setEditingSong(song);
    setModalVisible(false);
    setKaraokeListVisible(false);
    setEditModalVisible(true);
  };

  const handleSaveChanges = async (songId: number, updates: { title: string; artist: string }) => {
    try {
      await updateSongInDb(songId, updates);
      await refreshData();
      Alert.alert('Sucesso', 'As informações da música foram atualizadas.');
    } catch (error) {
      console.error('Erro ao atualizar a música:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  if (isProcessing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>{processingMessage}</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Modo Karaokê</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Escolha como você quer começar
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleImportAudio}>
          <AudioWaveform size={40} color="white" />
          <Text style={styles.buttonText}>Importar Novo Áudio</Text>
          <Text style={styles.buttonDescription}>Cante junto com uma nova música</Text>
        </TouchableOpacity>
        
        {/* NOVO BOTÃO DA BIBLIOTECA DE KARAOKÊ */}
        <TouchableOpacity style={[styles.button, { backgroundColor: '#8E44AD' }]} onPress={() => setKaraokeListVisible(true)}>
          <ListMusic size={40} color="white" />
          <Text style={styles.buttonText}>Biblioteca de Karaokê</Text>
          <Text style={styles.buttonDescription}>Acesse suas músicas de karaokê salvas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#3498DB' }]} onPress={() => setModalVisible(true)}>
          <Library size={40} color="white" />
          <Text style={styles.buttonText}>Buscar na Biblioteca</Text>
          <Text style={styles.buttonDescription}>Leia as letras das músicas salvas no app</Text>
        </TouchableOpacity>
      </View>

      {/* Modal original para todas as músicas */}
      <SongSelectionModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSelectSong={handleSelectSong}
        onLongPressSong={handleLongPressSong}
        filter='all' // Prop para mostrar todas as músicas
      />

      {/* NOVO MODAL para a lista de karaokês */}
      <SongSelectionModal
        isVisible={isKaraokeListVisible}
        onClose={() => setKaraokeListVisible(false)}
        onSelectSong={handleSelectSong}
        onLongPressSong={handleLongPressSong}
        filter='karaoke' // Prop para filtrar apenas karaokê
      />

      <EditSongModal
        isVisible={isEditModalVisible}
        song={editingSong}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveChanges}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { position: 'absolute', top: 100, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold' },
  subtitle: { fontSize: 18, marginTop: 8 },
  loadingText: { marginTop: 20, fontSize: 18 },
  buttonContainer: { width: '100%', paddingHorizontal: 30 },
  button: { padding: 25, borderRadius: 20, alignItems: 'center', marginBottom: 25, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  buttonText: { fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: 10, paddingHorizontal: 10, textAlign: 'center' }, // Adicionado textAlign center
  buttonDescription: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginTop: 5, textAlign: 'center' }, // Adicionado textAlign center
});