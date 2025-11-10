
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname } from 'expo-router';
import {
  Home,
  Upload,
  Clock,
  Music2,
  Settings,
  LucideProps,
} from 'lucide-react-native';
import React, { memo, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

interface NavButtonProps {
  icon: React.ComponentType<LucideProps>;
  isActive: boolean;
  onPress: () => void;
  colors: typeof Colors.light;
}

const NavButton = memo(({ icon: Icon, isActive, onPress, colors }: NavButtonProps) => {
  // CORREÇÃO: 'isDarkMode' foi movido para antes de seu uso.
  const { isDarkMode } = useApp();
  const inactiveColor = useMemo(() => (isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(26, 31, 58, 0.7)'), [isDarkMode]);

  return (
    <TouchableOpacity
      style={[
        styles.navButton,
        isActive && [styles.navButtonActive, { backgroundColor: colors.secondary }],
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon size={24} color={isActive ? colors.primary : inactiveColor} strokeWidth={2.5} />
    </TouchableOpacity>
  );
});

NavButton.displayName = 'NavButton';

const FloatingNavMenu = memo(() => {
  const { isDarkMode } = useApp();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const colors = isDarkMode ? Colors.dark : Colors.light;

  const navigateToHome = useCallback(() => router.push('/'), []);
  const navigateToImport = useCallback(() => router.push('/import'), []);
  const navigateToQuickAccess = useCallback(() => router.push('/quick-access'), []);
  const navigateToPlayer = useCallback(() => router.push('/player'), []);
  const navigateToSettings = useCallback(() => router.push('/settings'), []);

  const isActive = useCallback(
    (route: string) => {
      if (route === '/') {
        return pathname === route || pathname.startsWith('/song') || pathname.startsWith('/category') || pathname.startsWith('/all-songs');
      }
      return pathname.startsWith(route);
    },
    [pathname]
  );

  const bottomOffset = useMemo(() => {
    const base = insets.bottom > 0 ? insets.bottom - 10 : 20;
    return Platform.OS === 'ios' ? base : 24;
  }, [insets.bottom]);

  return (
    <View style={[styles.container, { bottom: bottomOffset }]}>
      <LinearGradient
        colors={['rgba(26, 31, 58, 0.95)', 'rgba(42, 48, 78, 0.92)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.menuContent}>
          <NavButton
            icon={Home}
            isActive={isActive('/')}
            onPress={navigateToHome}
            colors={colors}
          />
          <NavButton
            icon={Upload}
            isActive={isActive('/import')}
            onPress={navigateToImport}
            colors={colors}
          />
          <NavButton
            icon={Clock}
            isActive={isActive('/quick-access')}
            onPress={navigateToQuickAccess}
            colors={colors}
          />
          <NavButton
            icon={Music2}
            isActive={isActive('/player')}
            onPress={navigateToPlayer}
            colors={colors}
          />
          <NavButton
            icon={Settings}
            isActive={isActive('/settings')}
            onPress={navigateToSettings}
            colors={colors}
          />
        </View>
      </LinearGradient>
    </View>
  );
});

FloatingNavMenu.displayName = 'FloatingNavMenu';

export default FloatingNavMenu;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 1000,
    elevation: 10,
  },
  gradient: {
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  menuContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonActive: {
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
