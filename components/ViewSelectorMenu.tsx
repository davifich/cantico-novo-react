
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { CaseSensitive, Music, FileText, X } from 'lucide-react-native'; // CORREÇÃO: Ícones importados da biblioteca correta

import Colors from '../constants/colors';
import { useApp } from '../contexts/AppContext';

interface ViewSelectorMenuProps {
  sheetRef: React.RefObject<BottomSheet>;
  hasPartitura: boolean;
  onSelectMode: (mode: 'letra' | 'cifra' | 'partitura') => void;
}

const ViewSelectorMenu = ({ sheetRef, hasPartitura, onSelectMode }: ViewSelectorMenuProps) => {
  const { isDarkMode } = useApp();
  const colors = useMemo(() => (isDarkMode ? Colors.dark : Colors.light), [isDarkMode]);
  const snapPoints = useMemo(() => ['35%'], []);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: colors.textLight }}
      backgroundStyle={{ backgroundColor: colors.surface }}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Modo de Visualização</Text>
          <TouchableOpacity onPress={() => sheetRef.current?.close()}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.option} onPress={() => onSelectMode('letra')}>
          <CaseSensitive size={24} color={colors.primary} />
          <Text style={[styles.optionText, { color: colors.text }]}>Letra</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={() => onSelectMode('cifra')}>
          <Music size={24} color={colors.primary} />
          <Text style={[styles.optionText, { color: colors.text }]}>Cifra</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, !hasPartitura && styles.optionDisabled]}
          onPress={() => onSelectMode('partitura')}
          disabled={!hasPartitura}
        >
          <FileText size={24} color={!hasPartitura ? colors.textLight : colors.primary} />
          <Text style={[styles.optionText, { color: !hasPartitura ? colors.textLight : colors.text }]}>
            Partitura
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionDisabled: {
    opacity: 0.5,
  },
});

export default ViewSelectorMenu;
