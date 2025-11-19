import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import {
  ZoomIn,
  ZoomOut,
  Minimize,
  CirclePlay,
  CirclePause,
} from "lucide-react-native";
import Colors from "../constants/colors";
import { useApp } from "../contexts/AppContext";

interface SideBarMenuProps {
  viewMode: 'letra' | 'cifra' | 'partitura';
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomLevel: number;
  maxZoomLevel: number;
  onToggleFullscreen: () => void;
  autoScroll: { isScrolling: boolean; speed: number };
  onToggleAutoScroll: () => void;
  onChangeScrollSpeed: (speed: number) => void;
}

export default function SideBarMenu({ 
  viewMode,
  onZoomIn, 
  onZoomOut, 
  zoomLevel, 
  maxZoomLevel,
  onToggleFullscreen,
  autoScroll,
  onToggleAutoScroll,
  onChangeScrollSpeed,
}: SideBarMenuProps) {
  const { isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);

  const showZoom = viewMode === 'letra' || viewMode === 'cifra';
  const iconColor = colors.text;

  const handleMainScrollClick = () => {
    if (autoScroll.isScrolling) {
      onToggleAutoScroll();
      setShowSpeedOptions(false);
    } else {
      // When pressing play, directly start with the current speed and hide options.
      if (!showSpeedOptions) {
        onChangeScrollSpeed(autoScroll.speed);
      }
      setShowSpeedOptions(prev => !prev);
    }
  };

  const handleSpeedSelection = (speed: number) => {
    onChangeScrollSpeed(speed);
    setShowSpeedOptions(false);
  };

  return (
    <View style={styles.container}>
      {/* Botão de Fechar (Minimizar) */}
      <TouchableOpacity style={styles.button} onPress={onToggleFullscreen}>
        <Minimize size={22} color={iconColor} />
      </TouchableOpacity>

      {/* Botões de Zoom */}
      {showZoom && (
        <>
          <TouchableOpacity style={styles.button} onPress={onZoomOut} disabled={zoomLevel === 0}>
            <ZoomOut size={22} color={zoomLevel === 0 ? colors.textSecondary : iconColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onZoomIn} disabled={zoomLevel === maxZoomLevel}>
            <ZoomIn size={22} color={zoomLevel === maxZoomLevel ? colors.textSecondary : iconColor} />
          </TouchableOpacity>
        </>
      )}

      {/* Botão de Auto-Scroll Principal */}
      {showZoom && (
        <TouchableOpacity style={styles.button} onPress={handleMainScrollClick}>
          {autoScroll.isScrolling ? <CirclePause size={22} color={iconColor} /> : <CirclePlay size={22} color={iconColor} />}
        </TouchableOpacity>
      )}

      {/* Opções de Velocidade de Auto-Scroll */}
      {showSpeedOptions && !autoScroll.isScrolling && (
        <View style={styles.speedOptionsContainer}>
          {[2, 5, 10].map(speed => (
            <TouchableOpacity 
              key={speed} 
              style={[styles.speedButton, { backgroundColor: colors.primary }]} 
              onPress={() => handleSpeedSelection(speed)}
            >
              <Text style={styles.speedButtonText}>{speed}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 10,
    alignItems: 'center',
    gap: 15,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  speedOptionsContainer: {
    alignItems: 'center',
    gap: 10,
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    width: '100%',
  },
  speedButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
