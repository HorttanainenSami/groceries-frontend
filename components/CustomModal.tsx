import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import IconButton from './IconButton';
type CustomModalProps = {
  visible: boolean,
  onClose: () => void,
}
const CustomModal = ({ visible, onClose }: CustomModalProps) => {
  const [text, setText] = useState('');
  
  const handleAddText = () => {
    console.log('Added Text:', text);
    setText('');
    onClose();
  };

  const handleAccept = () => {
    console.log('Accepted');
    onClose();
  };

  const handleDecline = () => {
    console.log('Declined');
    onClose();
  };

  const handleSetAlarm = () => {
    console.log('Alarm Set');
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
          <View style ={styles.headerButtons}>
            <IconButton icon='alert' onPress={handleAccept}/>
            <IconButton icon='alert' onPress={handleAccept}/>
          </View>
          <Text style={styles.title}>Uusi tehtävä</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter text here..."
            value={text}
            onChangeText={setText}
          />
          <Pressable style={styles.button} onPress={handleSetAlarm}>
            <Text style={styles.buttonText}>Set Alarm</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  headerButtons: {
    flexDirection:'row',
    justifyContent: 'space-between',
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

export default CustomModal;
