import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  iconColor?: string;
  iconSize?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  style,
  iconColor = '#222',
  iconSize = 24,
  disabled,
  accessibilityLabel,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        style,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name={icon} size={iconSize} color={iconColor} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  pressed: {
    backgroundColor: '#e3e3e3',
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});

export default IconButton;
