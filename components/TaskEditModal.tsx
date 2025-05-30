import React, { useState } from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import IconButton from './IconButton';
import { TaskType } from '../types';
import Modal from './Modal';
import TextInputComponent from './TextInputComponent';

type TaskEditModalProps = {
  onClose: () => void;
  onAccept: (a: TaskType) => void;
  onDelete: (a: TaskType) => void;
  task: TaskType | null;
};
const TaskEditModal = ({
  onClose,
  onAccept,
  task,
  onDelete,
}: TaskEditModalProps) => {
  const [text, setText] = useState('');
  const inputRef = React.useRef<TextInput | null>(null);

  React.useEffect(() => {
    if (!task) return;

    setText(task.task);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const length = task.task.length;
        inputRef.current.setSelection(length, length);
      }
    }, 100);
  }, [task]);

  const handleClose = () => {
    setText('');
    onClose();
  };
  const handleAccept = () => {
    if (task) {
      onAccept({ ...task, task: text });
    }
  };

  const handleDelete = () => {
    console.log('Deleted');
    if (task) onDelete(task);
    handleClose();
  };

  return (
    <Modal
      visible={!!task}
      onClose={handleClose}
      onAccept={handleAccept}
      title="Muokkaa tehtävää">
      <View style={styles.container}>
        <TextInputComponent
          ref={inputRef}
          placeholder="Muokkaa tehtävää"
          style={styles.input}
          value={text}
          onChangeText={setText}
        />
        <IconButton
          style={styles.deleteButton}
          onPress={handleDelete}
          icon="trash"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 0,
    backgroundColor: '#fff',
    alignItems: 'stretch',
  },
  input: {
    width: '100%',
    marginBottom: 26,
  },
  deleteButton: {
    alignSelf: 'center',
  },
});

export default TaskEditModal;
