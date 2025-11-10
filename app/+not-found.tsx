import { Link, Stack } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Página não encontrada' }} />
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <AlertCircle size={64} color="#d4af37" />
        </View>
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.message}>Esta página não existe.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Voltar ao início</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#1a1f3a',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#d4af37',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#e6edf3',
    textAlign: 'center',
    marginBottom: 32,
  },
  link: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#d4af37',
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1f3a',
  },
});
