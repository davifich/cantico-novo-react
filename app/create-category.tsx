
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

const colorOptions = [
  '#FF5733', '#FFC300', '#DAF7A6', '#C70039', '#900C3F',
  '#581845', '#1ABC9C', '#2ECC71', '#3498DB', '#9B59B6'
];

export default function CreateCategoryScreen() {
  const { isDarkMode, addCategory } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

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
      const newCategoryId = await addCategory(name.trim(), selectedColor);
      if (newCategoryId !== null) {
        Alert.alert('Sucesso!', 'A categoria foi criada.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        throw new Error('Falha ao obter ID da nova categoria.');
      }
    } catch (error) {
      console.error('Falha ao salvar categoria:', error);
      Alert.alert('Erro', 'Não foi possível criar a categoria. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Criar Nova Categoria' }} />
      
      <View style={styles.formContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Nome da Categoria</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Louvores de Adoração"
          placeholderTextColor={colors.textLight}
        />

        <Text style={[styles.label, { color: colors.text, marginTop: 24 }]}>Cor de Destaque</Text>
        <View style={styles.colorSelector}>
          {colorOptions.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColor,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: isSaving ? colors.primaryLight : colors.primary }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.secondary} />
          ) : (
            <Text style={[styles.saveButtonText, { color: colors.secondary }]}>Salvar</Text>
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
  formContainer: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
  },
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: 8,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: 'white', // Idealmente, uma cor do tema
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
