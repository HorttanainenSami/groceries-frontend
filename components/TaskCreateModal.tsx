import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import Modal from './Modal';

type TaskCreateModalProps = {
  visible: boolean;
  onClose: () => void;
  onAccept: (a: string) => void;
};
const TaskCreateModal = ({
  visible,
  onClose,
  onAccept,
}: TaskCreateModalProps) => {
  const [text, setText] = useState('');
  const inputRef = React.useRef<TextInput | null>(null);

  React.useEffect(() => {
    if (!visible) return;
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, [visible]);

  const handleAccept = () => {
    onAccept(text);
  };

  const handleClose = () => {
    setText('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      onAccept={handleAccept}
      title="Uusi tehtävä">
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder="Enter text here..."
        value={text}
        onChangeText={setText}
      />
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

export default TaskCreateModal;
