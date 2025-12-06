import React from 'react';
import { TextInput, Text, View, StyleSheet, TextInputProps } from 'react-native';

type TextInputComponentProps = TextInputProps & {
  label?: string;
  error?: string;
};

const TextInputComponent = React.forwardRef<TextInput, TextInputComponentProps>(
  ({ label, error, style, ...rest }, ref) => (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        ref={ref}
        style={[
          styles.input,
          error && styles.inputError,
          rest.editable === false && styles.inputDisabled,
          style,
        ]}
        placeholderTextColor="#aaa"
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    color: '#444',
    marginBottom: 6,
    marginLeft: 2,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#222',
  },
  inputError: {
    borderColor: '#e53935',
  },
  inputDisabled: {
    backgroundColor: '#eee',
    color: '#aaa',
  },
  errorText: {
    color: '#e53935',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 2,
  },
});

export default TextInputComponent;
