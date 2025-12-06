import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import IconButton from './IconButton';

export type ModalProps = React.PropsWithChildren & {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  title: string;
};

const TaskCreateModal = ({ children, title, visible, onClose, onAccept }: ModalProps) => {
  const handleAccept = () => {
    onAccept();
    handleClose();
  };
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <IconButton icon="arrow-back" onPress={handleClose} />
            <Text style={styles.title}>{title}</Text>
            <IconButton icon="checkmark" onPress={handleAccept} />
          </View>

          {children}
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});

export default TaskCreateModal;
