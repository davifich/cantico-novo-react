
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { Upload, FileText, Music, AlertCircle } from 'lucide-react-native';
import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import mammoth from 'mammoth';
import { decode } from 'base-64';

import FloatingNavMenu from '@/components/FloatingNavMenu';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { addSong } from '@/lib/database';

// Função para converter Base64 para ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = decode(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

interface ImportCardProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  colors: typeof Colors.light;
  onPress: () => void;
}

const ImportCard = memo(({ icon: Icon, title, description, colors, onPress }: ImportCardProps) => (
  <TouchableOpacity style={[styles.importCard, { backgroundColor: colors.card }]} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
      <Icon size={32} color={colors.secondary} strokeWidth={2} />
    </View>
    <View style={styles.cardContent}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{description}</Text>
    </View>
  </TouchableOpacity>
));

ImportCard.displayName = 'ImportCard';

export default function ImportScreen() {
  const { isDarkMode } = useApp();
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const colors = isDarkMode ? Colors.dark : Colors.light;

  const handleImportLyrics = useCallback(async () => {
    try {
      setIsImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: 'base64',
        });

        const arrayBuffer = base64ToArrayBuffer(base64);
        const mammothResult = await mammoth.extractRawText({ arrayBuffer });

        const songId = await addSong({
          title: file.name.replace('.docx', ''),
          content: mammothResult.value,
          type: 'letra',
        });

        Alert.alert(
          'Importação Concluída',
          `A letra "${file.name}" foi importada com sucesso!`,
          [{ text: 'OK', onPress: () => router.push(`/song/${songId}`) }]
        );
      }
    } catch (error) {
      console.error('Error importing lyrics:', error);
      Alert.alert('Erro', 'Não foi possível importar o arquivo.');
    } finally {
      setIsImporting(false);
    }
  }, []);

  const handleImportScore = useCallback(async () => {
    try {
      setIsImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const newFileName = `${uuidv4()}.pdf`;
        // CORREÇÃO: Usa uma asserção de tipo (as any) para contornar a verificação do TypeScript
        const docDir = ((FileSystem as any).documentDirectory || '') + 'partituras/';
        const newPath = `${docDir}${newFileName}`;

        await FileSystem.makeDirectoryAsync(docDir, {
          intermediates: true,
        });

        await FileSystem.copyAsync({
          from: file.uri,
          to: newPath,
        });

        const songId = await addSong({
          title: file.name.replace('.pdf', ''),
          file_path: newPath,
          type: 'partitura',
        });

        Alert.alert(
          'Importação Concluída',
          `A partitura "${file.name}" foi importada com sucesso!`,
          [{ text: 'OK', onPress: () => router.push(`/song/${songId}`) }]
        );
      }
    } catch (error) {
      console.error('Error importing score:', error);
      Alert.alert('Erro', 'Não foi possível importar o arquivo.');
    } finally {
      setIsImporting(false);
    }
  }, []);

  const handleCreateNew = useCallback(() => {
    router.push('/create-song');
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.title}>Importar & Editar</Text>
            <Text style={[styles.subtitle, { color: colors.secondary }]}>
              Adicione músicas ao seu repertório
            </Text>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isImporting && (
            <View style={[styles.loadingOverlay, { backgroundColor: colors.card }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>Importando...</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Importar Arquivos</Text>
            <ImportCard
              icon={FileText}
              title="Importar Letra/Cifra"
              description="DOCX com letras e cifras"
              colors={colors}
              onPress={handleImportLyrics}
            />
            <ImportCard
              icon={Music}
              title="Importar Partitura"
              description="PDF de partitura musical"
              colors={colors}
              onPress={handleImportScore}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Criar Nova Música</Text>
            <ImportCard
              icon={Upload}
              title="Criar do Zero"
              description="Digite letra e cifras manualmente"
              colors={colors}
              onPress={handleCreateNew}
            />
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <AlertCircle size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Arquivos DOCX serão processados para extração de texto. Partituras em PDF serão
              armazenadas para visualização.
            </Text>
          </View>
        </ScrollView>

        <FloatingNavMenu />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingBottom: 24,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  importCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
  loadingOverlay: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
  },
});
