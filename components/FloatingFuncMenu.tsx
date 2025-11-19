import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import {
  ZoomIn,
  ZoomOut,
  SquarePen,
  Maximize,
  Minimize,
  CirclePlus,
} from "lucide-react-native";
import Colors from "../constants/colors";
import { useApp } from "../contexts/AppContext";

interface FloatingFuncMenuProps {
  viewMode: 'letra' | 'cifra' | 'partitura';
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomLevel: number;
  maxZoomLevel: number;
  onEdit: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  hasCifra?: boolean;
  hasPartitura?: boolean;
}

export default function FloatingFuncMenu({ 
  viewMode,
  onZoomIn, 
  onZoomOut, 
  zoomLevel, 
  maxZoomLevel,
  onEdit,
  onToggleFullscreen,
  isFullscreen,
  hasCifra,
  hasPartitura,
}: FloatingFuncMenuProps) {
  const { isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

  const showZoom = viewMode === 'letra' || viewMode === 'cifra';
  const showAddButton = hasCifra || hasPartitura;

  const iconColor = '#FFFFFF';
  const disabledColor = colors.textLight;

  return (
    <View style={[styles.container, { backgroundColor: colors.primaryLight }]}>

      {/* Botão Adicionar (condicional) */}
      {showAddButton && (
        <TouchableOpacity style={styles.button} onPress={() => { /* Ação a ser definida */ }}>
          <CirclePlus size={22} color={iconColor} />
        </TouchableOpacity>
      )}

      {/* Botão Editar */}
      <TouchableOpacity style={styles.button} onPress={onEdit}>
        <SquarePen size={22} color={iconColor} />
      </TouchableOpacity>

      {/* Botões de Zoom */}
      {showZoom && (
        <>
          <TouchableOpacity style={styles.button} onPress={onZoomOut} disabled={zoomLevel === 0}>
            <ZoomOut size={22} color={zoomLevel === 0 ? disabledColor : iconColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onZoomIn} disabled={zoomLevel === maxZoomLevel}>
            <ZoomIn size={22} color={zoomLevel === maxZoomLevel ? disabledColor : iconColor} />
          </TouchableOpacity>
        </>
      )}

      {/* Botão Fullscreen dinâmico */}
      <TouchableOpacity style={styles.button} onPress={onToggleFullscreen}>
        {isFullscreen ? <Minimize size={22} color={iconColor} /> : <Maximize size={22} color={iconColor} />}
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: '5%',
    right: '5%',
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22, // Círculo perfeito
    justifyContent: "center",
    alignItems: "center",
  },
});
