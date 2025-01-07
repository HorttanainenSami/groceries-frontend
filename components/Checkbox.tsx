import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
type CheckboxtWithText = {
  checked? : boolean;
  text: string;
};
const CheckboxWithText = ({checked, text} : CheckboxtWithText) => {
  const [isChecked, setIsChecked] = useState(checked??false);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}>
      {/* Checkbox Pressable */}
      <Pressable
        onPress={() => setIsChecked(!isChecked)} // Toggle state
        style={{
          width: 24,
          height: 24,
          borderWidth: 2,
          borderColor: '#333',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 10,
          backgroundColor: isChecked ? '#4CAF50' : 'transparent',
        }}
      >
        {isChecked && (
          <Text style={{ color: 'white', fontSize: 18 }}>✓</Text> // Checkmark
        )}
      </Pressable>

      {/* Text with Overline when checked */}
      <Text
        style={{
          fontSize: 18,
          textDecorationLine: isChecked ? 'line-through' : 'none',
          color: isChecked ? '#555' : '#000',
        }}
      >
    {text}
      </Text>
    </View>
  );
};

export default CheckboxWithText;

