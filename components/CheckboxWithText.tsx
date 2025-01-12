import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Checkbox from './Checkbox';
type CheckboxWithTextProps = {
  checked? : boolean;
  text: string;
  onTextPress: void;
};
const CheckboxWithText = ({checked, text, onTextPress} : CheckboxWithTextProps) => {
  const [isChecked, setIsChecked] = useState(checked??false);

  return (
    <View style={styles.container}>
      <Checkbox
      isChecked={isChecked}
      toggle={() => setIsChecked(!isChecked)}
      />
      <Text
        style={[styles.text, isChecked&&styles.textCheckboxActive]}
      >
    {text}
      </Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container:{  flexDirection: 'row', alignItems: 'center', padding: 20},
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

