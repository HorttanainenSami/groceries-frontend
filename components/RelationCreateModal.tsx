import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import Modal from './Modal';
import TextInputComponent from './TextInputComponent';

type RelationCreateModalProps = {
  visible: boolean;
  onClose: () => void;
  onAccept: (a: string) => void;
};
const RelationCreateModal = ({
  visible,
  onClose,
  onAccept,
}: RelationCreateModalProps) => {
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
    if(text.length === 0) {
      onAccept('Uusi lista');
      return;
    }
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
      title="Uusi lista">
      <View style={{ width: '90%', paddingVertical: 16 }}>
        <TextInputComponent
          ref={inputRef}
          placeholder="Listan nimi"
          value={text}
          onChangeText={setText}
        />
      </View>
    </Modal>
  );
};

export default RelationCreateModal;
