
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Clock, SquarePen, Trash2 } from 'lucide-react-native'; // Import Trash2 for remove action
import Colors from '../constants/colors';

interface SongActionsPopoverProps {
  isVisible: boolean;
  onClose: () => void;
  onEdit: () => void;
  colors: typeof Colors.light;
  // New props for dynamic queue action
  queueActionText: string;
  onQueueAction: () => void;
  isSongInQueue: boolean;
}

const SongActPopover: React.FC<SongActionsPopoverProps> = ({ 
  isVisible, 
  onClose, 
  onEdit, 
  colors,
  queueActionText,
  onQueueAction,
  isSongInQueue,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.popover, { backgroundColor: colors.card }]}>
          {/* Dynamic Queue Action */}
          <TouchableOpacity style={styles.option} onPress={onQueueAction}>
            {isSongInQueue ? <Trash2 size={24} color={colors.text} /> : <Clock size={24} color={colors.text} />}
            <Text style={[styles.optionText, { color: colors.text }]}>{queueActionText}</Text>
          </TouchableOpacity>
          {/* Edit Action */}
          <TouchableOpacity style={styles.option} onPress={onEdit}>
            <SquarePen size={24} color={colors.text} />
            <Text style={[styles.optionText, { color: colors.text }]}>Editar Letra</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  popover: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  optionText: {
    marginLeft: 15,
    fontSize: 16,
  },
});

export default SongActPopover;
