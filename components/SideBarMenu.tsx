
import React, { useState, useRef, useCallback } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Animated, Easing } from "react-native";
import {
  ZoomIn,
  ZoomOut,
  Minimize,
  CirclePlay,
  CirclePause,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react-native";
import Colors from "../constants/colors";
import { useApp } from "../contexts/AppContext";

type ViewMode = 'letra' | 'cifra' | 'partitura';

interface SideBarMenuProps {
  viewMode: ViewMode;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomLevel: number;
  maxZoomLevel: number;
  onToggleFullscreen: () => void;
  autoScroll: { isScrolling: boolean; speed: number };
  onToggleAutoScroll: () => void;
  onChangeScrollSpeed: (speed: number) => void;
  onSelectMode?: (mode: ViewMode) => void;
  availableModes?: ViewMode[];
}

const MENU_WIDTH = 80;

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
  onSelectMode,
  availableModes = [],
}: SideBarMenuProps) {
  const { isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  
  const [isOpen, setIsOpen] = useState(false);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = useCallback(() => {
    const toValue = isOpen ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
    
    setIsOpen(!isOpen);
    if (isOpen) {
      setShowSpeedOptions(false);
    }
  }, [isOpen, animation]);

  const menuTranslateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [MENU_WIDTH + 20, 0],
  });

  const buttonTranslateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -MENU_WIDTH],
  });

  const iconColor = '#FFFFFF';
  const disabledColor = colors.textLight;
  const showZoom = viewMode === 'letra' || viewMode === 'cifra';

  const handleMainScrollClick = () => {
    if (autoScroll.isScrolling) {
      onToggleAutoScroll();
      setShowSpeedOptions(false);
    } else {
      setShowSpeedOptions(prev => !prev);
    }
  };

  const handleSpeedSelection = (speed: number) => {
    onChangeScrollSpeed(speed);
    setShowSpeedOptions(false);
    if (!autoScroll.isScrolling) {
      onToggleAutoScroll();
    }
  };

  const showModeSelector = onSelectMode && availableModes.length > 1;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <Animated.View style={[styles.toggleButtonContainer, { transform: [{ translateX: buttonTranslateX }] }]}>
        <TouchableOpacity onPress={toggleMenu} style={[styles.toggleButton, { backgroundColor: colors.primaryLight }]}>
          {isOpen ? <ChevronRight size={28} color={iconColor} /> : <Menu size={26} color={iconColor} />}
        </TouchableOpacity>
      </Animated.View>

      <Animated.View 
        style={[
          styles.menuContainer,
          { 
            backgroundColor: colors.primaryLight,
            transform: [{ translateX: menuTranslateX }] 
          }
        ]}
      >
        {showModeSelector && (
            <View style={styles.modeSelectorContainer}>
              {availableModes.map(mode => (
                <TouchableOpacity 
                  key={mode} 
                  style={[styles.modeButton, viewMode === mode && { backgroundColor: colors.primary }]} 
                  onPress={() => onSelectMode(mode)}
                >
                  <Text style={styles.modeButtonText}>{mode.charAt(0).toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {showModeSelector && <View style={styles.divider} />}

          <TouchableOpacity style={styles.button} onPress={onToggleFullscreen}>
            <Minimize size={26} color={iconColor} />
          </TouchableOpacity>

          {showZoom && (
            <>
              <TouchableOpacity style={styles.button} onPress={onZoomOut} disabled={zoomLevel === 0}>
                <ZoomOut size={26} color={zoomLevel === 0 ? disabledColor : iconColor} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={onZoomIn} disabled={zoomLevel === maxZoomLevel}>
                <ZoomIn size={26} color={zoomLevel === maxZoomLevel ? disabledColor : iconColor} />
              </TouchableOpacity>
            </>
          )}

          {showZoom && (
            <TouchableOpacity style={styles.button} onPress={handleMainScrollClick}>
              {autoScroll.isScrolling && !showSpeedOptions ? <CirclePause size={26} color={iconColor} /> : <CirclePlay size={26} color={iconColor} />}
            </TouchableOpacity>
          )}

          {showSpeedOptions && (
            <View style={styles.speedOptionsContainer}>
              {[2, 5, 10].map(speed => (
                <TouchableOpacity 
                  key={speed} 
                  style={[styles.speedButton, { backgroundColor: autoScroll.speed === speed ? colors.primaryLight : colors.primary }]} 
                  onPress={() => handleSpeedSelection(speed)}
                >
                  <Text style={styles.speedButtonText}>{speed}x</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  toggleButtonContainer: {
    position: 'absolute',
    right: 15,
    zIndex: 20,
  },
  toggleButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  menuContainer: {
    height: '70%',
    maxHeight: 500,
    width: MENU_WIDTH,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    elevation: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    zIndex: 10, 
  },
  divider: {
    height: 1,
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  modeSelectorContainer: {
    gap: 10,
    alignItems: 'center',
  },
  modeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  speedOptionsContainer: {
    alignItems: 'center',
    gap: 15,
    paddingVertical: 10,
    width: '100%',
  },
  speedButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
