
import { router, Stack } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { AddSongDTO } from '@/types/music'; // Importa o tipo para garantir a conformidade

export default function CreateSongScreen() {
  const { isDarkMode, addSong, refreshSongs } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [letra, setLetra] = useState('');
  const [cifra, setCifra] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Campo Obrigatório', 'O título da música não pode ficar em branco.');
      return;
    }

    setIsSaving(true);

    try {
      // CORREÇÃO: O objeto agora corresponde à interface AddSongDTO
      const newSong: AddSongDTO = {
        title: title.trim(),
        artist: artist.trim(),
        letra: letra.trim() || null,
        cifra: cifra.trim() || null,
        has_cifra: cifra.trim().length > 0, // Determina se há cifra com base no input
        has_partitura: false, // Criação manual não tem partitura
        file_path: null,
        category_ids: [], // Começa sem categorias
      };

      const newSongId = await addSong(newSong);

      if (typeof newSongId === 'number') {
        await refreshSongs(); 
        Alert.alert('Sucesso!', 'A música foi salva.', [
          {
            text: 'OK',
            onPress: () => router.replace(`/song/${newSongId}`),
          },
        ]);
      } else {
        throw new Error('Não foi possível obter o ID da nova música.');
      }
    } catch (error) {
      console.error('Error saving song:', error);
      Alert.alert('Erro', 'Ocorreu um problema ao salvar a música. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }, [title, artist, letra, cifra, addSong, refreshSongs]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Criar Nova Música' }} />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Título *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Hino da Vitória"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Artista (Opcional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            value={artist}
            onChangeText={setArtist}
            placeholder="Fernanda Brum"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Letra</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            value={letra}
            onChangeText={setLetra}
            placeholder="O Senhor é a minha luz e a minha salvação..."
            placeholderTextColor={colors.textLight}
            multiline
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Cifra</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            value={cifra}
            onChangeText={setCifra}
            placeholder="G D Em C..."
            placeholderTextColor={colors.textLight}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: isSaving ? colors.primaryLight : colors.primary }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.secondary} />
          ) : (
            <Text style={[styles.saveButtonText, { color: colors.secondary }]}>Salvar Música</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
  },
  textArea: {
    height: 200,
    paddingVertical: 16,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
