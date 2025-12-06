import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
type CheckboxtWithText = {
  isChecked: boolean;
  toggle: () => void;
};
const Checkbox = ({ isChecked, toggle }: CheckboxtWithText) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}>
      <Pressable onPress={toggle} style={[styles.checkbox, isChecked && styles.checkboxActive]}>
        {isChecked && <Text style={styles.checkmark}>✓</Text>}
      </Pressable>
    </View>
  );
};
const styles = StyleSheet.create({
  checkmark: { color: 'white', fontSize: 18 },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  checkboxActive: { backgroundColor: '#4CAF50' },
});

export default Checkbox;
