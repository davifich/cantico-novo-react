
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { Upload, FileMusic, AlertCircle } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import FloatingNavMenu from '@/components/FloatingNavMenu';
import ImportCard from '@/components/ImportCard'; // Importa o componente modularizado
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

// As definições locais de ImportCardProps e ImportCard foram removidas.

export default function ImportScreen() {
  const { isDarkMode } = useApp();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const colors = isDarkMode ? Colors.dark : Colors.light;

  const handleFileImport = useCallback(async () => {
    if (isProcessing) return; // Previne cliques múltiplos
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/pdf',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets.length > 0) {
        setIsProcessing(true);
        const asset = result.assets[0];
        
        router.push({
          pathname: '/verify-import',
          params: { uri: asset.uri, name: asset.name, mimeType: asset.mimeType || '' },
        });

        // O estado de processamento é resetado na tela de verificação ou se o usuário voltar.
        // Adicionamos um timeout para garantir que ele seja resetado se a navegação falhar.
        setTimeout(() => setIsProcessing(false), 3000);
      }
    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error);
      Alert.alert('Erro', 'Não foi possível processar o arquivo selecionado.');
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const handleCreateNew = useCallback(() => {
    if (isProcessing) return;
    router.push('/create-song');
  }, [isProcessing]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.title}>Importar & Criar</Text>
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
          {isProcessing && (
            <View style={styles.loadingMessage}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>Processando arquivo...</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Importar de Arquivo</Text>
            <ImportCard
              icon={FileMusic}
              title="Importar de um arquivo"
              description="Selecione um arquivo .docx ou .pdf do seu dispositivo."
              colors={colors}
              onPress={handleFileImport}
              disabled={isProcessing} // A propriedade disabled agora funciona corretamente
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Criar Manualmente</Text>
            <ImportCard
              icon={Upload}
              title="Digitar uma nova música"
              description="Crie letra, cifras e adicione partituras do zero."
              colors={colors}
              onPress={handleCreateNew}
              disabled={isProcessing} // A propriedade disabled agora funciona corretamente
            />
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <AlertCircle size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              O app analisará o conteúdo do arquivo para identificar letras e cifras automaticamente. Partituras em PDF poderão ser salvas.
            </Text>
          </View>
        </ScrollView>

        <FloatingNavMenu />
      </SafeAreaView>
    </View>
  );
}

// Os estilos específicos do ImportCard foram movidos para o seu próprio arquivo.
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
  loadingMessage: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
  },
});
