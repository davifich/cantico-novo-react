
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '@/contexts/AppContext';
import { addCategory } from '@/lib/database';
import Colors from '@/constants/colors';

// Paleta de cores para o usuário escolher
const colorOptions = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', 
  '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'
];

export default function CreateCategoryScreen() {
  const { isDarkMode, refreshData } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const router = useRouter();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nome Inválido', 'O nome da categoria não pode ficar em branco.');
      return;
    }

    setIsSaving(true);
    try {
      // CORREÇÃO: Passando um único objeto como argumento
      const newCategoryId = await addCategory({ name: name.trim(), color: selectedColor });
      
      await refreshData(); // Garante que a lista de categorias seja atualizada
      
      Alert.alert('Sucesso!', 'A categoria foi criada.', [
        { text: 'OK', onPress: () => router.back() },
      ]);

    } catch (error) {
      console.error('Falha ao salvar categoria:', error);
      const errorMessage = error instanceof Error ? error.message : 'Tente novamente.';
      if (errorMessage.includes('UNIQUE constraint failed')) {
        Alert.alert('Erro', 'Já existe uma categoria com este nome.');
      } else {
        Alert.alert('Erro', `Não foi possível criar a categoria. ${errorMessage}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Criar Nova Categoria' }} />
      
      <View>
        <Text style={[styles.label, { color: colors.text }]}>Nome da Categoria</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex: Hinos da Harpa"
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.label, { color: colors.text }]}>Cor</Text>
        <View style={styles.colorContainer}>
          {colorOptions.map(color => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption, 
                { backgroundColor: color },
                selectedColor === color && { borderColor: colors.primary, borderWidth: 3 }
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity 
        onPress={handleSave} 
        style={[styles.saveButton, { backgroundColor: colors.primary }]} 
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Salvar Categoria</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 25,
    fontSize: 16,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 8,
  },
  saveButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
