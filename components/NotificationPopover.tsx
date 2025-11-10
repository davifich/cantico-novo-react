import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { X, Bell } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

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

  return (
    <View style={[styles.popover, { backgroundColor: colors.card }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Bell size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text, marginLeft: 8 }]}>
            Notificações
          </Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        {notifications.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhuma notificação nova
          </Text>
        ) : (
          notifications.map(notification => (
            <View
              key={notification.id}
              style={[
                styles.notificationItem,
                { borderBottomColor: colors.border },
                !notification.read && { backgroundColor: colors.primaryLight },
              ]}
            >
              <Text style={[styles.notificationText, { color: colors.text }]}>
                {notification.message}
              </Text>
              <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
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
      {notifications.length > 0 && (
        <TouchableOpacity style={[styles.clearAllButton, { borderTopColor: colors.border }]} onPress={onClearAll}>
          <Text style={[styles.clearAllButtonText, { color: colors.accent }]}>
            Limpar todas as notificações
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  popover: {
    position: 'absolute',
    top: 110, // Adjust based on your header height
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    maxHeight: 300, // Adjust as needed
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
    borderTopWidth: 1,
  },
  clearAllButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default NotificationPopover;
