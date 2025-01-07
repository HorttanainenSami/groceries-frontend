import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import IconButton from './IconButton';
import {checkboxText } from '../app/index';
type CustomModalProps = {
  visible: boolean,
  onClose: () => void,
  onAccept: (a: string) => void
}
const TaskEditModal = ({ visible, onClose, onAccept }: CustomModalProps) => {
  const [text, setText] = useState('');
  
  const handleAddText = () => {
    console.log('Added Text:', text);
    setText('');
    onClose();
  };

  const handleAccept = () => {
    console.log('Accepted');
    onAccept(text);
    onClose();
  };

  const handleDecline = () => {
    console.log('Declined');
    setText('');
    onClose();
  };


  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style ={styles.header}>
            <IconButton icon='arrow-back' onPress={handleDecline}/>
            <Text style={styles.title}>Uusi tehtävä</Text>
            <IconButton icon='checkmark' onPress={handleAccept}/>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter text here..."
            value={text}
            onChangeText={setText}
          />
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  header: {
    flexDirection:'row',
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
    alignItems: 'center',
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
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default TaskEditModal;
