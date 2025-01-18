import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  iconColor?: string;
  iconSize?: number;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  style,
  iconColor = "#fff",
  iconSize = 24,
  textStyle,
  disabled,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        style,
        pressed && styles.pressed,
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <Ionicons name={icon} size={iconSize} color='black' style={styles.icon} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    padding: 8,
    borderRadius: 50
  },
  pressed: {
    opacity: 0.5,
    backgroundColor: 'grey'
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IconButton;

