import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/contexts/AppContext";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

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
});
