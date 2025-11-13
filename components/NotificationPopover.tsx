import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { X, Bell } from 'lucide-react-native';
import Colors from '../constants/colors';
import { useApp } from '../contexts/AppContext';

export interface Notification {
  id: number;
  message: string;
  timestamp: string;
  read: boolean;
}

const NotificationPopover = ({
  notifications,
  onClose,
  onClear,
  onClearAll,
}: {
  notifications: Notification[];
  onClose: () => void;
  onClear: (id: number) => void;
  onClearAll: () => void;
}) => {
  const { isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const contentColors = Colors.light; // força tema claro no corpo

  return (
    <View style={[styles.popover, { backgroundColor: colors.background }]}>
      <View style={[styles.innerContainer, { backgroundColor: contentColors.card }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Bell size={20} color={contentColors.card} />
            <Text style={[styles.title, { color: contentColors.card, marginLeft: 8 }]}>
              Notificações
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={contentColors.card} />
          </TouchableOpacity>
        </View>

        {/* Corpo (ajustado para branco e letras pretas) */}
        <ScrollView style={[styles.scrollView, { backgroundColor: '#fff' }]}>
          {notifications.length === 0 ? (
            <Text style={[styles.emptyText, { color: '#555' }]}>
              Nenhuma notificação nova
            </Text>
          ) : (
            notifications.map(notification => (
              <View
                key={notification.id}
                style={[
                  styles.notificationItem,
                  { borderBottomColor: '#ddd', backgroundColor: '#fff' },
                  !notification.read && { backgroundColor: '#f9f9f9' },
                ]}
              >
                <Text style={[styles.notificationText, { color: '#000' }]}>
                  {notification.message}
                </Text>
                <Text style={[styles.timestamp, { color: '#666' }]}>
                  {notification.timestamp}
                </Text>
                {!notification.read && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => onClear(notification.id)}
                  >
                    <Text style={[styles.clearButtonText, { color: colors.primary }]}>
                      Marcar como lida
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Rodapé */}
        {notifications.length > 0 && (
          <TouchableOpacity
            style={[styles.clearAllButton, { backgroundColor: colors.primary }]}
            onPress={onClearAll}
          >
            <Text style={[styles.clearAllButtonText, { color: contentColors.card }]}>
              Limpar todas as notificações
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  popover: {
    position: 'absolute',
    top: 110,
    right: 20,
    width: 340,
    maxHeight: 450,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 1000,
  },
  innerContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    maxHeight: 300,
  },
  emptyText: {
    textAlign: 'center',
    padding: 24,
    fontSize: 15,
    fontStyle: 'italic',
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  notificationText: {
    fontSize: 15,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  clearAllButton: {
    padding: 16,
    alignItems: 'center',
  },
  clearAllButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default NotificationPopover;
