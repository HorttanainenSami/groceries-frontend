import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import IconButton from './IconButton';
import {checkboxText } from '../app/index';
type TaskEditModalProps = {
  onClose: () => void,
  onAccept: (a: checkboxText) => void,
  onDelete: (a: checkboxText) => void,
  task: checkboxText|null
}
const TaskEditModal = ({ onClose, onAccept, task, onDelete }: TaskEditModalProps) => {
  const [text, setText] = useState('');
  const inputRef = React.useRef<TextInput| null>(null); 

  React.useEffect(()=> {
    if(!task) return;

      setText(task.text);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const length = task.text.length;
          inputRef.current.setSelection(length, length );
        }
      }, 100);
  },[task]);
  
  const handleAccept = () => {
    console.log('Accepted');
    if(task){
      onAccept({...task, text});
    };
    onClose();
  };

  const handleDecline = () => {
    console.log('Declined');
    onClose();
  };

  const handleDelete = () => {
    console.log('Deleted');
    if(task) onDelete(task);
    onClose();
  };


  return (
    <Modal
      transparent={true}
      visible={!!task}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style ={styles.header}>
            <IconButton icon='arrow-back' onPress={handleDecline}/>
            <Text style={styles.title}>Muokkaa tehtävää</Text>
            <IconButton icon='checkmark' onPress={handleAccept}/>
          </View>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Enter text here..."
            value={text}
            onChangeText={setText}
          />
          <IconButton onPress={handleDelete} icon='trash' />
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
