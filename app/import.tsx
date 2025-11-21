
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
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import FloatingNavMenu from '../components/FloatingNavMenu';
import ImportCard from '../components/ImportCard';
import Colors from '../constants/colors';
import { useApp } from '../contexts/AppContext';

export default function ImportScreen() {
  const { isDarkMode } = useApp();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isInfoVisible, setInfoVisible] = useState(false);

  const colors = isDarkMode ? Colors.dark : Colors.light;

  const handleFileImport = useCallback(async () => {
    if (isProcessing) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/pdf',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      if (result.assets && result.assets.length > 0) {
        setIsProcessing(true);
        const asset = result.assets[0];
        
        router.push({
          pathname: '/verify-import',
          params: { uri: asset.uri, name: asset.name, mimeType: asset.mimeType || '' },
        });

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
    router.push('/song-form');
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
              disabled={isProcessing}
            />
          </View>

          <View style={[styles.section, { marginBottom: 20 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Criar Manualmente</Text>
            <ImportCard
              icon={Upload}
              title="Digitar uma nova música"
              description="Crie letra, cifras e adicione partituras do zero."
              colors={colors}
              onPress={handleCreateNew}
              disabled={isProcessing}
            />
          </View>
        </ScrollView>

        <FloatingNavMenu />

        <Modal
          transparent
          visible={isInfoVisible}
          animationType="slide"
          onRequestClose={() => setInfoVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setInfoVisible(false)}>
            <View style={[styles.popoverContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                O app analisará o conteúdo do arquivo para identificar letras e cifras automaticamente. Partituras em PDF poderão ser salvas.
              </Text>
            </View>
          </Pressable>
        </Modal>

        <TouchableOpacity
          style={[styles.infoButton, { backgroundColor: colors.card }]}
          onPress={() => setInfoVisible(true)} // Changed from onLongPress to onPress
          activeOpacity={0.8}
        >
          <AlertCircle size={24} color={colors.primary} />
        </TouchableOpacity>

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
    paddingBottom: 20,
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
  loadingMessage: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  infoButton: {
    position: 'absolute',
    bottom: 95,
    left: 20,
    padding: 14,
    borderRadius: 99,
    elevation: 5,
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  popoverContainer: {
    width: '100%',
    padding: 24,
    paddingBottom: 40, 
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 20,
    boxShadow: '0px -3px 8px rgba(0, 0, 0, 0.2)',
  },
  infoText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    textAlign: 'center',
  },
});
