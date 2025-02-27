import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import IconButton from './IconButton';
import {TaskType} from '../types';
import Modal from './Modal';

type TaskEditModalProps = {
  onClose: () => void,
  onAccept: (a: TaskType) => void,
  onDelete: (a: TaskType) => void,
  task: TaskType|null
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
  
  const handleClose = () => {
    setText('');
    onClose();
  }
  const handleAccept = () => {
    if(task){
      onAccept({...task, text});
    };
  };

  const handleDelete = () => {
    console.log('Deleted');
    if(task) onDelete(task);
    handleClose();
  };


  return (
    <Modal
      visible={!!task}
      onClose={handleClose}
      onAccept={handleAccept}
      title='Muokkaa tehtävää'
    >
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="Enter text here..."
        value={text}
        onChangeText={setText}
      />
      <IconButton onPress={handleDelete} icon='trash' />
    </Modal>
  );
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});

export default TaskEditModal;
