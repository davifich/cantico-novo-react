import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/contexts/AppContext";
import { trpc, trpcClient } from "@/lib/trpc";
import { initDatabase } from "@/lib/database";

// Previne que a splash screen desapareça automaticamente
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30 * 1000,
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Voltar",
        headerTintColor: "#d4af37",
        headerStyle: {
          backgroundColor: "#1a1f3a",
        },
        headerTitleStyle: {
          fontWeight: "600",
        },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="all-songs"
        options={{
          title: "Todas as Músicas",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          title: "Categorias",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="category/[id]"
        options={{
          title: "Categoria",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="quick-access"
        options={{
          title: "Acesso Rápido",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="song/[id]"
        options={{
          title: "Música",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Configurações",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="import"
        options={{
          title: "Importar & Editar",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="player"
        options={{
          title: "Estúdio de Ensaio",
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Esconde a splash screen assim que possível
        await SplashScreen.hideAsync();
        
        // Inicializa o banco de dados em segundo plano
        await initDatabase();

        // Adiciona um pequeno delay para garantir que a transição seja suave
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        setInitError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        // Sinaliza que a preparação (boa ou má) terminou
        setIsReady(true);
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    // Retorna null (ou um componente de loading) enquanto o app prepara
    return null;
  }

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>⚠️ Erro de Inicialização</Text>
        <Text style={styles.errorMessage}>{initError}</Text>
        <Text style={styles.errorHint}>
          Verifique as permissões do app e tente reiniciar.
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <GestureHandlerRootView style={styles.container}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </AppProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1f3a',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorHint: {
    fontSize: 14,
    color: '#d4af37',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});