import {
  UseControllerProps,
  useController,
  FieldValues,
} from 'react-hook-form';
import { Text, View, StyleSheet, TextInputProps } from 'react-native';
import TextInputComponent from './TextInputComponent';

export type RHFTextInputProps<TFieldValues extends FieldValues> =
  UseControllerProps<TFieldValues>;
export type FormInputProps<TFieldValues extends FieldValues> = TextInputProps &
  RHFTextInputProps<TFieldValues> & {
    label?: string;
  };

function FormInput<TFieldValues extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  label,
  ...rest
}: FormInputProps<TFieldValues>) {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
    shouldUnregister,
  });

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInputComponent
        {...rest}
        error={error?.message}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
      />
    </View>
  );
}

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

export default FormInput;
