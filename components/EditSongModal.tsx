import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Music } from '@/types/music';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';

interface EditSongModalProps {
  isVisible: boolean;
  song: Music | null;
  onClose: () => void;
  onSave: (songId: number, updates: { title: string; artist: string }) => Promise<void>;
}

export default function EditSongModal({ isVisible, song, onClose, onSave }: EditSongModalProps) {
  const { isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist || '');
    } else {
      // Limpa os campos quando o modal é fechado ou não há música
      setTitle('');
      setArtist('');
    }
  }, [song]);

  const handleSave = async () => {
    if (!song || isSaving) return;

    setIsSaving(true);
    try {
      await onSave(song.id, { title, artist });
      onClose(); // Fecha o modal após salvar
    } catch (error) {
      console.error("Erro ao salvar a música:", error);
      // Opcional: mostrar um alerta de erro para o usuário
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flexOne}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Editar Música</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Título</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Título da música"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Artista</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
              value={artist}
              onChangeText={setArtist}
              placeholder="Nome do artista"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]} disabled={isSaving}>
              <Text style={styles.buttonText}>{isSaving ? 'Salvando...' : 'Salvar'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  modalContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#888',
    marginRight: 10,
  },
  saveButton: {
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
