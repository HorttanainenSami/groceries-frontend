import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Checkbox from './Checkbox';
type CheckboxWithTextProps = {
  checked : boolean;
  text: string;
  onToggle: () => void,
};
const CheckboxWithText = ({checked, text, onToggle } : CheckboxWithTextProps) => {
  const handleToggle = () => {
    onToggle();
  };
  return (
    <Pressable onPress={handleToggle} style={styles.container}>
      <Checkbox
      isChecked={checked}
      toggle={handleToggle}
      />
      <Text
        style={[styles.text, checked&&styles.textCheckboxActive]}
      >
    {text}
      </Text>
    </Pressable>
  );
};
const styles = StyleSheet.create({
  container:{
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    textDecorationLine:'none',
    color: '#000',
  },
  textCheckboxActive: {
    textDecorationLine: 'line-through',
    color: '#555',
  }
  
});

export default CheckboxWithText;

