import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import Modal from './Modal';
import TextInputComponent from './TextInputComponent';

type TaskCreateModalProps = {
  visible: boolean;
  onClose: () => void;
  onAccept: (a: string) => void;
};
const TaskCreateModal = ({ visible, onClose, onAccept }: TaskCreateModalProps) => {
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
    <Modal visible={visible} onClose={handleClose} onAccept={handleAccept} title="Uusi tehtävä">
      <View style={{ width: '90%', paddingVertical: 16 }}>
        <TextInputComponent
          ref={inputRef}
          placeholder="Lisää tehtävä"
          value={text}
          onChangeText={setText}
        />
      </View>
    </Modal>
  );
};

export default TaskCreateModal;
