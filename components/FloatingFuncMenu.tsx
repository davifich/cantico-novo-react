import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  Home,
  UploadCloud,
  Clock,
  Music,
  Settings,
} from "lucide-react-native";
import Colors from "../constants/colors";
import { useApp } from "../contexts/AppContext";

export default function MenuFlutuante() {
  const router = useRouter();
  const { isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: colors.primaryLight }]}>
      {/* Home */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.secondary }]}
        onPress={() => router.push("/")}
      >
        <Home size={22} color={colors.primary} />
      </TouchableOpacity>

      {/* Importar */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/import")}
      >
        <UploadCloud size={22} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Histórico */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/quick-access")}
      >
        <Clock size={22} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Todas as músicas */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/all-songs")}
      >
        <Music size={22} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Configurações */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/settings")}
      >
        <Settings size={22} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    width: "90%",
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 10,
  },
  button: {
    width: 42,
    height: 42,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
