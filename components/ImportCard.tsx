
import { LucideIcon } from 'lucide-react-native';
import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import Colors from '../constants/colors';

// 1. A interface de Props agora aceita a propriedade opcional `disabled`
interface ImportCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  colors: typeof Colors.light;
  onPress: () => void;
  disabled?: boolean;
}

const ImportCard = memo(
  ({ icon: Icon, title, description, colors, onPress, disabled }: ImportCardProps) => {
    // 2. O estilo do card e a propriedade `disabled` do TouchableOpacity são aplicados condicionalmente
    const cardStyle = [
      styles.importCard,
      { backgroundColor: colors.card },
      disabled && styles.disabledCard, // Aplica o estilo de opacidade se desabilitado
    ];

    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} disabled={disabled}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
          <Icon size={32} color={colors.secondary} strokeWidth={2} />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{description}</Text>
        </View>
      </TouchableOpacity>
    );
  }
);

ImportCard.displayName = 'ImportCard';

const styles = StyleSheet.create({
  importCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  // 3. Estilo que define a aparência do card quando desabilitado
  disabledCard: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default ImportCard;
